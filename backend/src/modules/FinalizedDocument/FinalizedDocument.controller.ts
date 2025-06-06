import { Request, Response } from "express";
import DB from "../../database";

class FinalizedDocumentController {
    static async create(req: Request, res: Response): Promise<void> {
        const { content } = req.body || {};

        if (!content) {
            res.status(400).json({ message: "Content is required" });
            return;
        }

        try {
            const finalizedDocument = await DB.finalized_documents.create({ content });
            res.status(200).json({ message: "Finalized document created successfully", finalizedDocument });
        } catch (error) {
            console.error("Error creating finalized document:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const finalizedDocuments = await DB.finalized_documents.findAll({
                order: [['id', 'DESC']]
            });
            res.status(200).json(finalizedDocuments);
        } catch (error) {
            console.error("Error fetching finalized documents:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default FinalizedDocumentController;