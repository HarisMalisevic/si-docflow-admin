import { Request, Response } from "express";
import db from "../database/db";
import ClientLog from "../database/ClientLog";

class ClientLogController {

    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const logs: ClientLog[] = await db.client_logs.findAll();
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
            const logData = req.body;
            const newLog: ClientLog = await db.client_logs.create(logData);
            res.status(201).json(newLog);
        } catch (error) {
            console.error("Error creating client log:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

}

export default ClientLogController;