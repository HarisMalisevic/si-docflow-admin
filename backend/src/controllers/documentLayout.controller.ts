import db from "../database/db";
import { Request, Response } from "express";
import DocumentLayout from "../database/DocumentLayout";
import LayoutImage from "database/LayoutImage";

interface CreateDocumentLayoutBody {
  name: string;
  fields: string;
  document_type?: number;
  image_width: number;
  image_height: number;
}

class DocumentLayoutsController {
  static async getAll(req: Request, res: Response) {
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

  static async getById(req: Request, res: Response) {
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

      res.json(documentLayout);

    } catch (error) {
      console.error("Error finding document layout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getImageByLayoutId(req: Request, res: Response) {
    const { id } = req.params;

    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    try {
      const documentLayout: DocumentLayout = await db.document_layouts.findOne({
        where: { id: numericId },
      });

      if (!documentLayout) {
        res
          .status(404)
          .json({ message: `Document layout with ID ${numericId} not found` });
        return;
      }

      const layoutImage: LayoutImage = await db.layout_images.findOne({
        where: { id: documentLayout.image_id }
      });

      const layoutImageBlob: Blob = layoutImage.image as Blob;

      // TODO: Provjeriti koji headeri su potrebni za sliku
      res.setHeader("Content-Type", "image/png"); // TODO: Provjeriti koji je tip slike
      res.setHeader("Content-Length", layoutImageBlob.size);
      res.status(200).send(layoutImageBlob);

    } catch (error) {
      console.error("Error finding document layout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response) { //TODO: Change create logic to support image upload
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

  static async update(req: Request, res: Response) {
    // TODO: Implement update logic
  }

  static async delete(req: Request, res: Response) {
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
