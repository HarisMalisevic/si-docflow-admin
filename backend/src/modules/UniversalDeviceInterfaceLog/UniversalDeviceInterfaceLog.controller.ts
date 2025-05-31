import { Request, Response } from "express";
import DB from "../../database";
import UniversalDeviceInterfaceLog from "../UniversalDeviceInterfaceLog/UniversalDeviceInterfaceLog.model";

class UniversalDeviceInterfaceLogController {

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const {
                level,
                source,
                event_id,
                task_category,
                message,
                app_instance_id
            } = req.body;

            if (
                !level ||
                !source ||
                !event_id ||
                !task_category ||
                !message ||
                !app_instance_id
            ) {
                res.status(400).json({ message: "Missing required fields" });
            }

            const newLog = await DB.universal_device_interface_logs.create({
                level,
                source,
                event_id,
                task_category,
                message,
                app_instance_id
            });

            res.status(201).json(newLog);
        } catch (error) {
            console.error("Error creating universal device interface log: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const logs: UniversalDeviceInterfaceLog[] = await DB.universal_device_interface_logs.findAll({
                order: [["createdAt", "DESC"]],
            });
            res.status(200).json(logs);
        } catch (error) {
            console.error("Error fetching universal device logs: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getLatestN(req: Request, res: Response): Promise<void> {
        const { n } = req.params;
        const numericN = parseInt(n, 10);

        if (isNaN(numericN) || numericN < 0) {
            res.status(400).json({ message: "Invalid number of latest universal device logs" });
            return;
        }

        try {
            const logs: UniversalDeviceInterfaceLog[] = await DB.universal_device_interface_logs.findAll({
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