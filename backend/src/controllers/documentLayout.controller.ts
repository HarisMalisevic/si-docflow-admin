import db from "../database/db";
import { Request, Response } from "express";
import DocumentLayout from "../database/DocumentLayout";

interface Field {
  name: string;
  upper_left: { x: number; y: number };
  lower_right: { x: number; y: number };
}
interface CreateDocumentLayoutBody {
  name: string;
  fields: Field[];
  document_type?: number;
  image_width: number;
  image_height: number;
}

class DocumentLayoutsController {
  static async getAllDocumentLayouts(req: Request, res: Response) {
    try {
      const allDocumentLayouts: DocumentLayout[] =
        await db.document_layouts.findAll();

      console.log("All document layouts: ", JSON.stringify(allDocumentLayouts));
      res.json(allDocumentLayouts);
    } catch (error) {
      console.error("Error fetching document layouts: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async createDocumentLayout(req: Request, res: Response) {
    const jsonReq: CreateDocumentLayoutBody = req.body || {};

    if (!jsonReq.name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }
    if (!jsonReq.fields) {
      res.status(400).json({ message: "Fields is required" });
      return;
    }

    if (
      jsonReq.document_type !== undefined &&
      (typeof jsonReq.document_type !== "number" || isNaN(jsonReq.document_type))
    ) {
      res.status(400).json({ message: "Document type must be a number" });
      return;
    }

    if (
      jsonReq.image_width === undefined ||
      jsonReq.image_width === null ||
      typeof jsonReq.image_width !== "number" ||
      jsonReq.image_width <= 0
    ) {
      res.status(400).json({
        message: "Image width is required and must be a positive number",
      });
      return;
    }
    if (
      jsonReq.image_height === undefined ||
      jsonReq.image_height === null ||
      typeof jsonReq.image_height !== "number" ||
      jsonReq.image_height <= 0
    ) {
      res.status(400).json({
        message: "Image height is required and must be a positive number",
      });
      return;
    }

    const userID: number = (req.user as { id: number }).id;

    console.log("User ID: ", userID);

    try {
      console.log("Creating document layout with data: ", jsonReq);
      await db.document_layouts.create({
        name: jsonReq.name,
        fields: jsonReq.fields,
        image_width: jsonReq.image_width,
        image_height: jsonReq.image_height,
        created_by: userID,
        document_type: jsonReq.document_type !== undefined ? jsonReq.document_type : null,
      });
      console.log("Document layout created successfully");
      res.status(200).json({ message: "Document layout added successfully" });
    } catch (error) {
      console.error("Error creating document layout: ", error);
      res.status(500).json({ message: "Failed to add document layout", error });
    }
  }

  static async deleteDocumentLayout(req: Request, res: Response) {
    const { id } = req.params;

    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    try {
      const documentLayout = await db.document_layouts.findOne({
        where: { id: numericId },
      });

      if (!documentLayout) {
        res
          .status(404)
          .json({ message: `Document layout with ID ${numericId} not found` });
        return;
      }

      await db.document_layouts.destroy({ where: { id: numericId } });
      res.json({ message: `Document layout ${numericId} removed` });
    } catch (error) {
      console.error("Error removing document layout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default DocumentLayoutsController;
