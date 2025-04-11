import db from "../database/db";
import { Request, Response } from "express";
import DocumentLayout from "../database/DocumentLayout";

class DocumentLayoutsController {
  static async getAllDocumentLayouts(req: Request, res: Response) {
    try {
      const allDocumentLayouts: DocumentLayout[] = await db.document_layouts.findAll();

      if (allDocumentLayouts.length === 0) {
        throw new Error("No document layouts found in the database!");
      }
      res.json(allDocumentLayouts);
    } catch (error) {
      console.error("Error fetching document layouts: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async createDocumentLayout(req: Request, res: Response) {
    const jsonReq: {
      id?: number,
      name: string,
      description?: string,
      metadata: string,
      document_type?: number,
      created_by?: number
    } = req.body || {};

    if (!jsonReq.name) {
      res.status(400).json({ message: "Name is required" });
      return;
    } else if (!jsonReq.metadata) {
      res.status(400).json({ message: "Metadata is required" });
      return;
    } 

    try {
      await db.document_layouts.create({
        id: jsonReq.id,
        name: jsonReq.name,
        description: jsonReq.description,
        metadata: jsonReq.metadata,
        document_type: jsonReq.document_type,
        created_by: jsonReq.created_by,
      });
      
      res.status(200).json({ message: "Document layout added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add document layout", error });
    }
  }

  static async deleteDocumentLayout(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const document_layout = await db.document_layouts.findOne({ where: { id } });

      if (!document_layout) {
        res
          .status(404)
          .json({ message: `Document layout with ID ${id} not found` });
        return;
      }

      await db.document_layouts.destroy({ where: { id } });
    } catch (error) {
      console.error("Error removing document layout:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    res.json({ message: `Document layout ${id} removed` });
}

export default DocumentLayoutsController;
