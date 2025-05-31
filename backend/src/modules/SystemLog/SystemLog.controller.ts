import { Request, Response } from "express";
import DB from "../../database";
import SystemLog from "./SystemLog.model";

class SystemLogsController {
    static async getAll(req: Request, res: Response) {
        try {
            const logs: SystemLog[] = await DB.system_logs.findAll({
                order: [["createdAt", "DESC"]],
            });
            res.status(200).json(logs);
        } catch (error) {
            console.error("Error fetching system logs: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getLatestN(req: Request, res: Response) {
        const { n } = req.params;
        const numericN = parseInt(n, 10);

        if (isNaN(numericN) || numericN < 0) {
            res.status(400).json({ message: "Invalid number of latest system logs" });
            return;
        }

        try {
            const logs: SystemLog[] = await DB.system_logs.findAll({
                order: [["createdAt", "DESC"]],
                limit: numericN,
            });
            res.status(200).json(logs);
        } catch (error) {
            console.error(`Error fetching latest ${n} system logs: `, error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default SystemLogsController;