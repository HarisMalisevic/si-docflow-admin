import db from "../database/db";
import { Request, Response } from "express";
import DocumentLayout from "../database/DocumentLayout";
import LayoutImage from "database/LayoutImage";
import path from "path";
import fs from "fs/promises";


async function saveImageToDisk(imageFile: Express.Multer.File) {
  const SAVE_LOCATION = path.join(__dirname, "../../uploads");

  // Ensure the directory exists
  await fs.mkdir(SAVE_LOCATION, { recursive: true });

  const imageFilePath = path.join(SAVE_LOCATION, imageFile.originalname);

  // Save the image file to the local disk
  await fs.writeFile(imageFilePath, imageFile.buffer);
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

  static async create(req: Request, res: Response) {//TODO: Change create logic to support image upload

    try {
      // Extract the file and metadata

      const imageFile = req.file;
      const metadataJson = req.body.metadata;

      if (!imageFile || !metadataJson) {
        res.status(400).json({ message: "Missing image or metadata" });
      }

      const metadata = JSON.parse(metadataJson);
      console.log("Parsed metadata: ", metadata);

      // saveImageToDisk - Za potrebe testiranja /backend/uploads
      //saveImageToDisk(imageFile!).catch((error) => { console.error("Error saving image:", error) });

      const {
        name,
        fields,
        document_type,
        image_width,
        image_height
      } = metadata;

      // Now you can save metadata + image path to your DB, etc.
      console.log("Received layout:");
      console.log({ name, fields, document_type, image_width, image_height });

      // TODO: Spasiti sliku u tabelu layout_images, spasiti metadata u tabelu document_layouts

      res.status(201).json({ message: "Layout saved successfully" });
      return;
    } catch (error) {
      console.error("Error saving layout:", error);
      res.status(500).json({ message: "Server error while saving layout" });
      return;
    }
  };


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
