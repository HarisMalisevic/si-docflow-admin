import { Request, Response } from "express";
import db from "../database/db";

class ProcessingRuleController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const processingRules = await db.processing_rules.findAll();
            res.json(processingRules);
        } catch (error) {
            console.error("Error fetching processing rules:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const processingRule = await db.processing_rules.findOne({
                where: { id }
            });
            
            if (!processingRule) {
                res.status(404).json({ message: `Processing rule with ID ${id} not found` });
                return;
            }
            res.json(processingRule);
        } catch (error) {
            console.error("Error fetching processing rule:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        const { title, description, document_type_id, is_active } = req.body;
        const userID: number = (req.user as { id: number }).id;

        if (!title || !document_type_id) {
            res.status(400).json({ message: "Title and document_type_id are required" });
            return;
        }

        try {
            const newProcessingRule = await db.processing_rules.create({
                title,
                description,
                document_type_id,
                is_active,
                created_by: userID,
            });
            res.status(201).json(newProcessingRule);
        } catch (error) {
            console.error("Error creating processing rule:", error);
            res.status(400).json({ message: "Failed to create processing rule", error });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { title, description, document_type_id, is_active } = req.body;
        const userID: number = (req.user as { id: number }).id;

        try {
            const processingRule = await db.processing_rules.findOne({ where: { id } });
            if (!processingRule) {
                res.status(404).json({ message: `Processing rule with ID ${id} not found` });
                return;
            }

            await processingRule.update({
                title,
                description,
                document_type_id,
                is_active,
                updated_by: userID,
            });

            res.json({ message: "Processing rule updated successfully" });
        } catch (error) {
            console.error("Error updating processing rule:", error);
            res.status(400).json({ message: "Failed to update processing rule", error });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const processingRule = await db.processing_rules.findOne({ where: { id } });
            if (!processingRule) {
                res.status(404).json({ message: `Processing rule with ID ${id} not found` });
                return;
            }

            await db.processing_rules.destroy({ where: { id } });
            res.json({ message: `Processing rule ${id} deleted successfully` });
        } catch (error) {
            console.error("Error deleting processing rule:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default ProcessingRuleController;