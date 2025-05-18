import { Request, Response } from "express";
import RemoteTransactionsController from "./remoteTransactions.controller";
import { TransactionStatus } from "../database/RemoteTransaction";
import { processingNamespace } from "../server";
import RemoteInitiatorController from "./RemoteInitiator.controller"; // Import the RemoteInitiatorController
import WindowsAppInstanceController from "./windowsAppInstance.controller";
import fetch from 'node-fetch';

interface RemoteProcessingCommandAttributes {
    target_instance_id: number;
    document_type_id: number;
    file_name: string;
}

interface RemoteProcessingResultAttributes {
    document_type_id: number;
    file_name: string;
    ocr_result: JSON;
}

class RemoteProcessingController {
    static async receiveAndForwardProcessingCommand(req: Request, res: Response) {
        const initiatorKey = req.header('initiator-key');  // include initiator key for identification
        const socketId = req.header('socket-id');          // include websocket connection id for future communication with the initiator
        const jsonReq: RemoteProcessingCommandAttributes = req.body || {};

        // Validate initiatorKey
        if (!initiatorKey) {
            console.error("Missing initiator key");
            res.status(400).json({ message: 'Bad request: Missing initiator key' });
            return;
        }

        try {
            const isValidKey = await RemoteInitiatorController.validateKey(initiatorKey);
            if (!isValidKey) {
                console.error("Invalid initiator key");
                res.status(403).json({ message: 'Forbidden: Invalid initiator key' });
                return;
            }
        } catch (error) {
            // Send a response to the command initiator if the key is invalid
            console.error("Error validating initiator key:", error);
            res.status(500).json({ message: 'Error validating initiator key' });
            return;
        }

        if (!socketId) {
            console.error("Missing socket ID");
            res.status(400).json({ message: 'Bad request: Missing socket ID' });
            return;
        }

        // save the parameters to remote_transactions
        const transactionCreateResult = await RemoteProcessingController.createTransaction(initiatorKey, socketId, jsonReq);

        if (transactionCreateResult?.status !== 200) {
            console.error("Failed to create transaction, status: ", transactionCreateResult?.status);
            res.status(transactionCreateResult?.status ?? 500).json({ message: transactionCreateResult?.message ?? 'Internal server error' });
            return;
        }

        // transaction successfully created, current status: STARTED
        const transactionId = transactionCreateResult.data?.id;
        console.log(`Transaction with ID ${transactionId} STARTED`);

        // fetch instance by target_instance_id to get machine ID
        const targetInstanceId = jsonReq.target_instance_id;
        const instanceGetByIdResult = await RemoteProcessingController.getInstanceById(targetInstanceId);

        if (instanceGetByIdResult?.status !== 200) {
            console.error("Failed to fetch instance, status: ", instanceGetByIdResult?.status);
            res.status(instanceGetByIdResult?.status ?? 500).json({ message: instanceGetByIdResult?.message ?? 'Internal server error' });
            return;
        }

        // get the machine ID
        const machineId = instanceGetByIdResult.data?.machine_id;

        if (!machineId) {
            console.error(`Missing machine ID for target instance ID ${targetInstanceId}`);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        // forward command to Windows App Instance
        const command = {
            transaction_id: transactionId,
            document_type_id: jsonReq.document_type_id,
            file_name: jsonReq.file_name,
        }

        const { default: fetch } = await import("node-fetch");
        const processingRequestResponse = await fetch(`http://${machineId}:8080/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(command),
        });

        if (!processingRequestResponse.ok) {
            console.error("Failed to forward processing command");
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        // command successfully forwarded to Windows App Instance

        // update transaction status to FORWARDED
        const transactionUpdateResult = await RemoteProcessingController.updateTransactionStatus(transactionId, TransactionStatus.FORWARDED);

        if (transactionUpdateResult?.status !== 200) {
            console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
            res.status(transactionUpdateResult?.status ?? 500).json({ message: transactionUpdateResult?.message ?? 'Internal server error' });
            return;
        }

        console.log(`Transaction with ID ${transactionId} FORWARDED`);
        res.status(200).json({ message: 'Processing command successfully forwarded' });
    }

    static async receiveAndForwardProcessingResult(req: Request, res: Response) {
        const transactionId = req.header('transaction-id');
        const jsonReq: RemoteProcessingResultAttributes = req.body || {};

        // fetch transaction for transactionId to get the socket ID
        const transactionGetByIdResult = await RemoteProcessingController.getTransactionById(transactionId);

        if (transactionGetByIdResult?.status !== 200) {
            console.error("Failed to fetch transaction, status: ", transactionGetByIdResult?.status);
            res.status(transactionGetByIdResult?.status ?? 500).json({ message: transactionGetByIdResult?.message ?? 'Internal server error' });
            return;
        }

        // get the websocket connection ID
        const socketId = transactionGetByIdResult.data?.socket_id;

        if (!socketId) {
            console.error(`Missing socket ID for transaction ID ${transactionId}`);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        if (!jsonReq["ocr_result"]) {
            // update transaction status to FAILED
            const transactionUpdateResult = await RemoteProcessingController.updateTransactionStatus(transactionId, TransactionStatus.FAILED);

            if (transactionUpdateResult?.status !== 200) {
                console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
            }

            res.status(transactionUpdateResult?.status ?? 500).json({ message: transactionUpdateResult?.message ?? 'Internal server error' });
            return;
        }

        // forward/emit processing result to Command Initiator based on socketId
        const socket = processingNamespace.sockets.get(socketId);
        if (!socket) {
            console.error(`Socket with ID ${socketId} not found`);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        socket.emit(
            "processingResult",
            {
                document_type_id: jsonReq["document_type_id"],
                file_name: jsonReq["file_name"],
                ocr_result: jsonReq["ocr_result"],
            },
            (response: { success: boolean; message: string }) => {
                if (response.success) {     // processing result successfully forwarded to Command Initiator
                    console.log("Initiator acknowledged processing result:", response.message);

                    // update transaction status to FINISHED
                    RemoteProcessingController.updateTransactionStatus(transactionId, TransactionStatus.FINISHED)
                        .then((transactionUpdateResult) => {
                            if (transactionUpdateResult?.status !== 200) {
                                console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
                            }
                            else {
                                console.log(`Transaction with ID ${transactionId} FINISHED`);
                            }
                        })
                        .catch((error) => {
                            console.error("Error updating transaction status: ", error);
                        });
                }
                else {
                    console.error("Initiator did not acknowledge processing result: ", response.message);

                    // update transaction status to FAILED
                    RemoteProcessingController.updateTransactionStatus(transactionId, TransactionStatus.FAILED)
                        .then((transactionUpdateResult) => {
                            if (transactionUpdateResult?.status !== 200) {
                                console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
                            }
                            else {
                                console.log(`Transaction with ID ${transactionId} FAILED`);
                            }
                        })
                        .catch((error) => {
                            console.error("Error updating transaction status: ", error);
                        });
                }
            }
        );

        res.status(200).json({ message: 'Processing result received' });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static async createTransaction(initiatorKey: any, socketId: any, jsonReq: RemoteProcessingCommandAttributes) {
        const reqForTransaction = {
            get: (headerName: string) => {
                if (headerName === "initiator-key") return initiatorKey;
                else if (headerName === "socket-id") return socketId;
                else return undefined;
            },
            body: {
                target_instance_id: jsonReq.target_instance_id,
                document_type_id: jsonReq.document_type_id,
                file_name: jsonReq.file_name,
                status: TransactionStatus.STARTED,
            },
        } as Request;

        try {
            const transactionCreateResult = await RemoteTransactionsController.createWithReturn(reqForTransaction);
            return { status: transactionCreateResult?.status, message: transactionCreateResult?.message, data: transactionCreateResult?.data };
        }
        catch (error) {
            console.error("Error while creating transaction: ", error);
            return { status: 500, message: 'Internal server error' };
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static async updateTransactionStatus(transactionId: any, transactionStatus: TransactionStatus) {
        const reqForStatusUpdate = {
            params: { id: transactionId },
            body: {
                status: transactionStatus,
            },
        } as Partial<Request> as Request;   // Partial<Request> to create an object that includes only the necessary parts of Request - no get here

        try {
            const transactionUpdateResult = await RemoteTransactionsController.updateStatusWithReturn(reqForStatusUpdate);
            return { status: transactionUpdateResult?.status, message: transactionUpdateResult?.message, data: transactionUpdateResult?.data };
        }
        catch (error) {
            console.error("Error while updating transaction status: ", error);
            return { status: 500, message: 'Internal server error' };
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static async getTransactionById(transactionId: any) {
        const reqForTransactionFetch = {
            params: { id: transactionId },
        } as Partial<Request> as Request;

        try {
            const transactionGetByIdResult = await RemoteTransactionsController.getByIdWithReturn(reqForTransactionFetch);
            return { status: transactionGetByIdResult?.status, message: transactionGetByIdResult?.message, data: transactionGetByIdResult?.data };
        }
        catch (error) {
            console.error(`Error while fetching transaction with id ${transactionId} : `, error);
            return { status: 500, message: 'Internal server error' };
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static async getInstanceById(instanceId: any) {
        const reqForInstanceFetch = {
            params: { id: instanceId },
        } as Partial<Request> as Request;

        try {
            const instanceGetByIdResult = await WindowsAppInstanceController.getByIdWithReturn(reqForInstanceFetch);
            return { status: instanceGetByIdResult?.status, message: instanceGetByIdResult?.message, data: instanceGetByIdResult?.data };
        }
        catch (error) {
            console.error(`Error while fetching instance with id ${instanceId} : `, error);
            return { status: 500, message: 'Internal server error' };
        }
    }
}

export default RemoteProcessingController;