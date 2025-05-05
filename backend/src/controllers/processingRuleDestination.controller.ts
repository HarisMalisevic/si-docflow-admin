import { Request, Response } from "express";
import db from "../database/db";

class ProcessingRuleDestinationController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const destinations = await db.processing_rule_destinations.findAll();
            res.json(destinations);
        } catch (error) {
            console.error("Error fetching processing rule destinations:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAllByDocumentTypeId(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const destinations = await db.processing_rule_destinations.findAll({
                where: { document_type_id: id },
            });
            res.json(destinations);
        } catch (error) {
            console.error("Error fetching destinations by document type ID:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAllByApiId(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const destinations = await db.processing_rule_destinations.findAll({
                where: { external_api_endpoint_id: id },
            });
            res.json(destinations);
        } catch (error) {
            console.error("Error fetching destinations by API ID:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAllByFtpId(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const destinations = await db.processing_rule_destinations.findAll({
                where: { external_ftp_endpoint_id: id },
            });
            res.json(destinations);
        } catch (error) {
            console.error("Error fetching destinations by FTP ID:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAllByLocalFolderId(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const destinations = await db.processing_rule_destinations.findAll({
                where: { local_storage_folder_id: id },
            });
            res.json(destinations);
        } catch (error) {
            console.error("Error fetching destinations by local folder ID:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        const { processing_rule_id, api_id, ftp_id, local_folder_id } = req.body;
        const userID: number = (req.user as { id: number }).id;


        if ([api_id, ftp_id, local_folder_id].filter((id) => id !== null && id !== undefined).length !== 1) {
            res.status(400).json({ message: "Only one of api_id, ftp_id, or local_folder_id can be non-null" });
            return;
        }

        try {
            const newDestination = await db.processing_rule_destinations.create({
                processing_rule_id,               // <— ovdje
                external_api_endpoint_id: api_id,
                external_ftp_endpoint_id: ftp_id,
                local_storage_folder_id: local_folder_id,
                is_active: true,
                created_by: userID,
              });

            res.status(201).json({
                message: "Processing rule destination created successfully",
                data: newDestination,
            });
        } catch (error) {
            console.error("Error creating processing rule destination:", error);
            res.status(400).json({ message: "Failed to create processing rule destination", error });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { document_type_id, api_id, ftp_id, local_folder_id, is_active } = req.body;
        const userID: number = (req.user as { id: number }).id;

        if ([api_id, ftp_id, local_folder_id].filter((id) => id !== null && id !== undefined).length !== 1) {
            res.status(400).json({ message: "Only one of api_id, ftp_id, or local_folder_id can be non-null" });
            return;
        }

        try {
            const destination = await db.processing_rule_destinations.findOne({ where: { id } });
            if (!destination) {
                res.status(404).json({ message: `Processing rule destination with ID ${id} not found` });
                return;
            }

            await destination.update({
                document_type_id,
                api_id,
                ftp_id,
                local_folder_id,
                is_active,
                updated_by: userID,
            });

            res.json({ message: "Processing rule destination updated successfully" });
        } catch (error) {
            console.error("Error updating processing rule destination:", error);
            res.status(400).json({ message: "Failed to update processing rule destination", error });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const destination = await db.processing_rule_destinations.findOne({ where: { id } });
            if (!destination) {
                res.status(404).json({ message: `Processing rule destination with ID ${id} not found` });
                return;
            }

            await db.processing_rule_destinations.destroy({ where: { id } });
            res.json({ message: `Processing rule destination ${id} deleted successfully` });
        } catch (error) {
            console.error("Error deleting processing rule destination:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default ProcessingRuleDestinationController;