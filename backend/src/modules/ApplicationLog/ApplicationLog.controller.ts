import DB from "../../database";
import { Request, Response } from "express";
import ApplicationLog from "../ApplicationLog/ApplicationLog.model";

class ApplicationLogsController {
  static async getAll(req: Request, res: Response) {
    try {
      const logs: ApplicationLog[] = await DB.application_logs.findAll({
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(logs);
    } catch (error) {
      console.error("Error fetching application logs: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getLatestN(req: Request, res: Response) {
    const { n } = req.params;
    const numericN = parseInt(n, 10);

    if (isNaN(numericN) || numericN < 0) {
      res
        .status(400)
        .json({ message: "Invalid number of latest application logs" });
      return;
    }

    try {
      const logs: ApplicationLog[] = await DB.application_logs.findAll({
        order: [["createdAt", "DESC"]],
        limit: numericN,
      });
      res.status(200).json(logs);
    } catch (error) {
      console.error(`Error fetching latest ${n} application logs: `, error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default ApplicationLogsController;
