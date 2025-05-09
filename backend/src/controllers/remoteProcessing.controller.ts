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

        const requiredFields: {
            key: keyof RemoteProcessingCommandAttributes;
            name: string;
        }[] = [
            { key: "target_instance_id", name: "Target Instance ID" },
            { key: "document_type_id", name: "Document Type ID" },
            { key: "file_name", name: "File Name" },
        ];

        for (const field of requiredFields) {
            if (jsonReq[field.key] === undefined || jsonReq[field.key] === null) {
                res.status(400).json({ message: `${field.name} is required` });
                return;
            }
        }

        const typeValidations: {
            key: keyof RemoteProcessingCommandAttributes;
            name: string;
            typeDescription: string;
            isInvalid: (value: any) => boolean;
        }[] = [
            { 
                key: "target_instance_id", 
                name: "Target Instance ID", 
                typeDescription: "number",
                isInvalid: (v) => typeof v !== "number", 
            },
            { 
                key: "document_type_id", 
                name: "Document Type ID",
                typeDescription: "number",
                isInvalid: (v) => typeof v !== "number", 
            },
            { 
                key: "file_name", 
                name: "File Name",
                typeDescription: "string",
                isInvalid: (v) => typeof v !== "string",  
            },
        ];

        for (const validation of typeValidations) {
            const value = jsonReq[validation.key];

            if (value !== undefined && value !== null) {
                if (validation.isInvalid(value)) {
                    res.status(400).json({ message: `${validation.name} must be a ${validation.typeDescription}` });
                    return;
                }
            }
        }

        // save parameters to remote_transactions
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
            
            if (transactionCreateResult?.status === 200) {    // transaction successfully created, current status: STARTED
                const transactionId = transactionCreateResult.data.id;

                // forward command to given Windows App Instance
                // ??????????

                // command successfully forwarded to Windows App Instance
                
                // update transaction status to FORWARDED
                const transactionUpdateResult = await this.updateTransactionStatus(transactionId, TransactionStatus.FORWARDED, res);

                if (transactionUpdateResult?.status !== 200) {
                    console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
                    res.status(500).json({ message: "Internal server error" });
                    return;
                }
            }
            else {
                console.error("Failed to create transaction, status: ", transactionCreateResult?.status);
                res.status(500).json({ message: "Internal server error" });
                return;
            }
        } 
        catch (error) {
            console.error("Error: ", error);
            res.status(500).json({ message: "Internal server error" });
            return;
        }
    }

    static async receiveAndForwardProcessingResult(req: Request, res: Response) {
        const transactionId = req.get('transaction-id');
        const jsonReq: RemoteProcessingResultAttributes = req.body || {};

        const requiredFields: {
            key: keyof RemoteProcessingResultAttributes;
            name: string;
        }[] = [
            { key: "document_type_id", name: "Document Type ID" },
            { key: "file_name", name: "File Name" },
            { key: "ocr_result", name: "OCR Result" }
        ];

        for (const field of requiredFields) {
            if (jsonReq[field.key] === undefined || jsonReq[field.key] === null) {
                // update transaction status to FAILED
                const transactionUpdateResult = await this.updateTransactionStatus(transactionId, TransactionStatus.FAILED, res);
                
                if (transactionUpdateResult?.status !== 200) {
                    console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
                }

                res.status(500).json({ message: `Remote processing failed` });
                return;
            }
        }

        // forward processing result to Command Initiator based on transactionId
        // ??????????

        // processing result successfully forwarded to Command Initiator

        // update transaction status to FINISHED
        const transactionUpdateResult = await this.updateTransactionStatus(transactionId, TransactionStatus.FINISHED, res);
                
        if (transactionUpdateResult?.status !== 200) {
            console.error("Failed to update transaction, status: ", transactionUpdateResult?.status);
            res.status(500).json({ message: "Internal server error" });
            return;
        }
    }

    static async updateTransactionStatus(transactionId: any, transactionStatus: TransactionStatus, res: Response) {
        const reqForStatusUpdate = {
            params: { id: transactionId },
            body: {
                status: transactionStatus,
            },
        } as Partial<Request> as Request;   // Partial<Request> to create an object that includes only the necessary parts of Request - no get here

        try {
            const transactionUpdateResult = await RemoteTransactionsController.updateStatusWithReturn(reqForStatusUpdate);
            return { status: transactionUpdateResult?.status };      
        }
        catch (error) {
            console.error("Error while updating transaction status: ", error);
            return { status: 500 };
        }
    }
}

export default RemoteProcessingController;