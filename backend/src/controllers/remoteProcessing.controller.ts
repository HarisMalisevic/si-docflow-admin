import { Request, Response } from "express";
import RemoteTransactionsController from "./remoteTransactions.controller";
import { TransactionStatus } from "database/RemoteTransaction";

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
        const initiatorKey = req.get('initiator-key');
        const jsonReq: RemoteProcessingCommandAttributes = req.body || {};

        // save parameters to remote_transactions
        const transactionCreateResult = await this.createTransaction(initiatorKey, jsonReq);

        if (transactionCreateResult?.status === 200) {       // transaction successfully created, current status: STARTED
            const transactionId = transactionCreateResult.data?.id;

            // forward command to given Windows App Instance ??????????

            // command successfully forwarded to Windows App Instance

            // update transaction status to FORWARDED
            const transactionUpdateResult = await this.updateTransactionStatus(transactionId, TransactionStatus.FORWARDED);

            if (transactionUpdateResult?.status !== 200) {
                console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
                res.status(transactionUpdateResult?.status ?? 500).json({ message: transactionUpdateResult?.message ?? 'Internal server error' });
                return;
            }

            res.status(200).json({ message: 'Processing command successfully forwarded' });
            return;
        }
        else {
            console.error("Failed to create transaction, status: ", transactionCreateResult?.status);
            res.status(transactionCreateResult?.status ?? 500).json({ message: transactionCreateResult?.message ?? 'Internal server error' });
            return;
        }
    }

    static async receiveAndForwardProcessingResult(req: Request, res: Response) {
        const transactionId = req.get('transaction-id');
        const jsonReq: RemoteProcessingResultAttributes = req.body || {};

        if (jsonReq["ocr_result"] === undefined || jsonReq["ocr_result"] === null) {
            // update transaction status to FAILED
            const transactionUpdateResult = await this.updateTransactionStatus(transactionId, TransactionStatus.FAILED);
            
            if (transactionUpdateResult?.status !== 200) {
                console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
            }

            res.status(transactionUpdateResult?.status ?? 500).json({ message: transactionUpdateResult?.message ?? 'Internal server error' });
            return;
        }

        // forward processing result to Command Initiator based on transactionId ??????????

        // processing result successfully forwarded to Command Initiator

        // update transaction status to FINISHED
        const transactionUpdateResult = await this.updateTransactionStatus(transactionId, TransactionStatus.FINISHED);
                
        if (transactionUpdateResult?.status !== 200) {
            console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
            res.status(transactionUpdateResult?.status ?? 500).json({ message: transactionUpdateResult?.message ?? 'INternal server error' });
            return;
        }

        res.status(200).json({ message: 'Processing result successfully forwarded' });
        return;
    }

    static async createTransaction(initiatorKey: any, jsonReq: RemoteProcessingCommandAttributes) {
        const reqForTransaction = {
            get: (headerName: string) => headerName === "initiator-key" ? initiatorKey : undefined,
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

    static async updateTransactionStatus(transactionId: any, transactionStatus: TransactionStatus) {
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
}

export default RemoteProcessingController;