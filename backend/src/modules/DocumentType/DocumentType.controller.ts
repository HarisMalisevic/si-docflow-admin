import { Request, Response } from "express";
import DB from "../../database";

class DocumentTypeController {
  static async getAll(req: Request, res: Response): Promise<void> {
    // Fetch document types from database

    try {
      const documentTypes = await DB.document_types.findAll();
      res.json(documentTypes);
    } catch (error) {
      console.error("Error fetching document types:", error);
      res.status(500).json({ message: "Internal server error" });
    }


  }

  static async create(req: Request, res: Response): Promise<void> {
    // Add a new document type to the database

    const jsonReq: { name: string; description?: string; } = req.body || {};

    if (!jsonReq.name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    const userID: number = (req.user as { id: number }).id;

    try {
      await DB.document_types.create({
        name: jsonReq.name,
        description: jsonReq.description,
        created_by: userID
      });
      res.status(200).json({ message: "Document type added successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to add document type", error });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    // Remove the document type from the database

    try {
      const documentType = await DB.document_types.findOne({ where: { id } });
      if (!documentType) {
        res.status(404).json({ message: `Document type with ID ${id} not found` });
        return;
      }

      await DB.document_types.destroy({ where: { id }, individualHooks: true });

      // Zbog afterDestroy hook na document_types, odgovarajući layout (i slika koja se veže za njega) se brišu automatski ukoliko isti postoje

    } catch (error) {
      console.error("Error removing document type:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    res.json({ message: `Document type ${id} removed` });
  }
}

export default DocumentTypeController;
