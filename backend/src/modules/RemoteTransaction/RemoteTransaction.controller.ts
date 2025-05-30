import DB from "../../database";
import { Request, Response } from "express";
import RemoteTransaction, {
  TransactionStatus,
  RemoteTransactionCreationAttributes,
  RemoteTransactionUpdateAttributes,
} from "./RemoteTransaction.model";
import { logsNamespace } from "../../server";

class RemoteTransactionsController {
  static async getAll(req: Request, res: Response) {
    try {
      const transactions: RemoteTransaction[] =
        await DB.remote_transactions.findAll({
          order: [["createdAt", "DESC"]],
        });
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching remote transactions: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getLatestN(req: Request, res: Response) {
    const { n } = req.params;
    const numericN = parseInt(n, 10);
    if (isNaN(numericN) || numericN < 0) {
      res
        .status(400)
        .json({ message: "Invalid number of latest transactions" });
      return;
    }
    try {
      const latestNTransactions = await DB.remote_transactions.findAll({
        order: [["createdAt", "DESC"]],
        limit: numericN,
      });
      res.status(200).json(latestNTransactions);
    } catch (error) {
      console.error(`Error fetching latest ${n} transactions: `, error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getById(req: Request, res: Response) {
    const getByIdResult = await RemoteTransactionsController.getByIdWithReturn(
      req
    );
    if (getByIdResult?.status === 200) {
      res.status(200).json(getByIdResult?.data);
    } else {
      res
        .status(getByIdResult?.status ?? 500)
        .json({ message: getByIdResult?.message ?? "Internal server error" });
    }
  }

  static async getByIdWithReturn(req: Request) {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return { status: 400, message: "Invalid ID format" };
    }
    try {
      const transaction = await DB.remote_transactions.findOne({
        where: { id: numericId },
      });
      if (!transaction) {
        return {
          status: 404,
          message: `No remote transaction found for ID: ${id}`,
        };
      }
      return { status: 200, data: transaction };
    } catch (error) {
      console.error(
        `Error fetching remote transaction with ID ${id}: ${error}`
      );
      return { status: 500, message: "Internal server error" };
    }
  }

  static async create(req: Request, res: Response) {
    const createResult = await RemoteTransactionsController.createWithReturn(
      req
    );
    if (createResult?.status === 201) {
      res.status(200).json(createResult?.data);
    } else {
      res
        .status(createResult?.status ?? 500)
        .json({ message: createResult?.message ?? "Internal server error" });
    }
  }

  static async createWithReturn(req: Request) {
    const initiatorKey = req.get("initiator-key");
    const socketId = req.get("socket-id");
    const jsonReq: RemoteTransactionCreationAttributes = req.body || {};

    if (!initiatorKey || initiatorKey === "") {
      return { status: 400, message: `Initiator key is required` };
    }
    if (!socketId || socketId === "") {
      return { status: 400, message: `Websocket connection ID is required` };
    }

    const requiredFields: {
      key: keyof RemoteTransactionCreationAttributes;
      name: string;
    }[] = [
        { key: "target_instance_id", name: "Target Instance ID" },
        { key: "document_type_id", name: "Document Type ID" },
        { key: "file_name", name: "File Name" },
        { key: "status", name: "Status" },
      ];

    for (const field of requiredFields) {
      if (jsonReq[field.key] === undefined || jsonReq[field.key] === null) {
        return { status: 400, message: `${field.name} is required` };
      }
    }

    const typeValidations: {
      key: keyof RemoteTransactionCreationAttributes;
      name: string;
      typeDescription: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        {
          key: "status",
          name: "Status",
          typeDescription: `one of ${Object.values(TransactionStatus).join(
            ", "
          )}`,
          isInvalid: (v) =>
            !Object.values(TransactionStatus).includes(v as TransactionStatus),
        },
      ];

    for (const validation of typeValidations) {
      const value = jsonReq[validation.key];
      if (value !== undefined && value !== null) {
        if (validation.isInvalid(value)) {
          return {
            status: 400,
            message: `${validation.name} must be a ${validation.typeDescription}`,
          };
        }
      }
    }

    const initiator = await DB.remote_initiators.findOne({
      where: { initiator_key: initiatorKey },
    });
    const initiatorId = initiator?.id;
    if (!initiator || typeof initiatorId !== "number") {
      return {
        status: 404,
        message: `No initiator found for initiator key: ${initiatorKey}`,
      };
    }

    try {
      const newTransaction = await DB.remote_transactions.create({
        initiator_id: initiatorId,
        target_instance_id: jsonReq.target_instance_id,
        document_type_id: jsonReq.document_type_id,
        file_name: jsonReq.file_name,
        status: jsonReq.status,
        socket_id: socketId,
      });

      if (logsNamespace) {
        logsNamespace.emit("new_transaction_log", newTransaction.toJSON());
      }

      return { status: 200, data: newTransaction };
    } catch (error) {
      console.error("Error creating remote transaction: ", error);
      return { status: 500, message: "Internal server error" };
    }
  }

  static async updateStatus(req: Request, res: Response) {
    const updateResult =
      await RemoteTransactionsController.updateStatusWithReturn(req);
    if (updateResult?.status === 200) {
      res.status(200).json(updateResult?.data);
    } else {
      res
        .status(updateResult?.status ?? 500)
        .json({ message: updateResult?.message ?? "Internal server error" });
    }
  }

  static async updateStatusWithReturn(req: Request) {
    const { id } = req.params;
    const jsonReq: RemoteTransactionUpdateAttributes = req.body || {};
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return { status: 400, message: "Invalid ID format" };
    }
    if (!jsonReq || !jsonReq?.status) {
      return {
        status: 400,
        message: "Request body for status update must contain a status",
      };
    }
    if (
      !Object.values(TransactionStatus).includes(
        jsonReq.status as TransactionStatus
      )
    ) {
      return {
        status: 400,
        message: `Status must be one of ${Object.values(TransactionStatus).join(
          ", "
        )}`,
      };
    }

    try {
      const transaction = await DB.remote_transactions.findOne({
        where: { id: numericId },
      });
      if (!transaction) {
        return {
          status: 404,
          message: `No remote transaction found for ID: ${id}`,
        };
      }
      transaction.status = jsonReq.status;
      await transaction.save();

      if (logsNamespace) {
        logsNamespace.emit("updated_transaction_log", transaction.toJSON());
      }

      return { status: 200, data: transaction };
    } catch (error) {
      console.error(
        `Error updating remote transaction with ID ${id}: ${error}`
      );
      return { status: 500, message: "Internal server error" };
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }
    try {
      const transaction = await DB.remote_transactions.findOne({
        where: { id: numericId },
      });
      if (!transaction) {
        res
          .status(404)
          .json({ message: `No remote transaction found for ID: ${id}` });
        return;
      }
      await DB.remote_transactions.destroy({
        where: { id: numericId },
      });

      if (logsNamespace) {
        logsNamespace.emit("deleted_transaction_log", { id: numericId });
      }

      res
        .status(200)
        .json({ message: `Remote transaction with ID ${id} removed` });
    } catch (error) {
      console.error(
        `Error deleting remote transaction with ID ${id}: ${error}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default RemoteTransactionsController;
