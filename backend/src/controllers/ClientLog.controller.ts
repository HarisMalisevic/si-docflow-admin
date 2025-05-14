import { Request, Response } from "express";
import db from "../database/db";
import ClientLog, { ClientActionType } from "../database/ClientLog";
import WindowsAppInstance from "../database/WindowsAppInstance";
import { logsNamespace } from "../server";

class ClientLogController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const logs: ClientLog[] = await db.client_logs.findAll({
        order: [["createdAt", "DESC"]],
      });
      res.json(logs);
    } catch (error) {
      console.error("Error fetching client logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getLatestN(req: Request, res: Response): Promise<void> {
    const n = parseInt(req.params.n, 10);
    if (isNaN(n) || n <= 0) {
      res.status(400).json({ message: "Invalid number of logs requested" });
      return;
    }
    try {
      const logs: ClientLog[] = await db.client_logs.findAll({
        limit: n,
        order: [["createdAt", "DESC"]],
      });
      res.json(logs);
    } catch (error) {
      console.error("Error fetching client logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { machine_id, action } = req.body;
      if (!machine_id || !action) {
        res
          .status(400)
          .json({ message: "Missing required fields: machine_id or action" });
        return;
      }
      if (!Object.values(ClientActionType).includes(action)) {
        res
          .status(400)
          .json({
            message: `Invalid action. Allowed actions are: ${Object.values(
              ClientActionType
            ).join(", ")}`,
          });
        return;
      }
      const instance = await WindowsAppInstance.findOne({
        where: { machine_id },
      });
      if (!instance) {
        res
          .status(404)
          .json({
            message: "WindowsAppInstance with the given machine_id not found",
          });
        return;
      }
      const newLog = await ClientLog.create({
        instance_id: instance.id,
        action,
      });

      if (logsNamespace) {
        logsNamespace.emit("new_client_log", newLog.toJSON());
      }

      res.status(201).json(newLog);
    } catch (error) {
      console.log("Error creating client log:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default ClientLogController;
