import { Request, Response } from "express";
import db from "../database/db";
import ProcessingRequestsBillingLog from "../database/ProcessingRequestsBillingLog";

class ProcessingRequestsBillingLogController {
  static async getAll(req: Request, res: Response) {
    try {
      const billing: ProcessingRequestsBillingLog[] = await db.processing_requests_billing_logs.findAll({
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(billing);
    } catch (error) {
      console.error("Error fetching processing requests billing log: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getLatestN(req: Request, res: Response) {
    const { n } = req.params;
    const numericN = parseInt(n, 10);

    if (isNaN(numericN) || numericN < 0) {
      res
        .status(400)
        .json({
          message: "Invalid number of latest processing requests billing logs",
        });
      return;
    }

    try {
      const billing: ProcessingRequestsBillingLog[] = await db.processing_requests_billing_logs.findAll({
        order: [["createdAt", "DESC"]],
        limit: numericN,
      });
      res.status(200).json(billing);
    } catch (error) {
      console.error("Error fetching processing requests billing log: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default ProcessingRequestsBillingLogController;
