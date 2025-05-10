import { Request, Response } from "express";
import RemoteTransactionsController from "./remoteTransactions.controller";
import { TransactionStatus } from "../database/RemoteTransaction";
import { processingNamespace } from "../server";
import { Socket } from "socket.io";

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

processingNamespace.on("connection", (socket: Socket) => {
    console.log(`New socket connected: ${socket.id}`);

    // Send the socket ID back to the client, they will send this with the processing command
    socket.emit("connected", socket.id);

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

class RemoteProcessingController {
    static async receiveAndForwardProcessingCommand(req: Request, res: Response) {
        const initiatorKey = req.get('initiator-key');  // include initiator key for identification
        const socketId = req.get('socket-id');          // include websocket connection id for future communication with the initiator
        const jsonReq: RemoteProcessingCommandAttributes = req.body || {};

        // validate initiatorKey, send a response to the command initiator if the key is invalid

        // save the parameters to remote_transactions
        const transactionCreateResult = await this.createTransaction(initiatorKey, socketId, jsonReq);

        if (transactionCreateResult?.status !== 200) {
            console.error("Failed to create transaction, status: ", transactionCreateResult?.status);
            res.status(transactionCreateResult?.status ?? 500).json({ message: transactionCreateResult?.message ?? 'Internal server error' });
            return;
        }

        // transaction successfully created, current status: STARTED
        const transactionId = transactionCreateResult.data?.id;
        console.log(`Transaction with ID ${transactionId} STARTED`);

        // forward command to Windows App Instance ??????????

        // command successfully forwarded to Windows App Instance

        // update transaction status to FORWARDED
        const transactionUpdateResult = await this.updateTransactionStatus(transactionId, TransactionStatus.FORWARDED);

        if (transactionUpdateResult?.status !== 200) {
            console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
            res.status(transactionUpdateResult?.status ?? 500).json({ message: transactionUpdateResult?.message ?? 'Internal server error' });
            return;
        }

        console.log(`Transaction with ID ${transactionId} FORWARDED`);
        res.status(200).json({ message: 'Processing command successfully forwarded' });
    }

    static async receiveAndForwardProcessingResult(req: Request, res: Response) {
        const transactionId = req.get('transaction-id');
        const jsonReq: RemoteProcessingResultAttributes = req.body || {};

        // fetch transaction for transactionId to get the socket ID
        const transactionGetByIdResult = await this.getTransactionById(transactionId);

        if (transactionGetByIdResult?.status !== 200) {
            console.error("Failed to update transaction, status: ", transactionGetByIdResult?.status);
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
            const transactionUpdateResult = await this.updateTransactionStatus(transactionId, TransactionStatus.FAILED);
            
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
                    this.updateTransactionStatus(transactionId, TransactionStatus.FINISHED)
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
                    this.updateTransactionStatus(transactionId, TransactionStatus.FAILED)
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
}

export default RemoteProcessingController;