import { Request, Response } from "express";
import db from "../database/db";
import UniversalDeviceInterfaceLog from "../database/UniversalDeviceInterfaceLog";

class UniversalDeviceInterfaceLogController {
    static async getAll(req: Request, res: Response) {
        try {
            const logs: UniversalDeviceInterfaceLog[] = await db.universal_device_interface_logs.findAll({
                order: [["createdAt", "DESC"]],
            });
            res.status(200).json(logs);
        } catch (error) {
            console.error("Error fetching universal device logs: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getLatestN(req: Request, res: Response) {
        const { n } = req.params;
        const numericN = parseInt(n, 10);

        if (isNaN(numericN) || numericN < 0) {
            res.status(400).json({ message: "Invalid number of latest universal device logs" });
            return;
        }

        try {
            const logs: UniversalDeviceInterfaceLog[] = await db.universal_device_interface_logs.findAll({
                order: [["createdAt", "DESC"]],
                limit: numericN,
            });
            res.status(200).json(logs);
        } catch (error) {
            console.error(`Error fetching latest ${n} universal device logs: `, error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default UniversalDeviceInterfaceLogController;