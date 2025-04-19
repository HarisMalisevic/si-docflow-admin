import db from "../database/db";
import { Request, Response } from "express";
import DocumentLayout from "../database/DocumentLayout";
import LayoutImage from "database/LayoutImage";
import path from "path";
import fs from "fs/promises";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        attributes: ['image_id'], // Fetch only the image_id
        where: { id: numericId },
      });


      if (!documentLayout || !documentLayout.image_id) {
        res
          .status(404)
          .json({ message: `Document layout with ID ${numericId} not found` });
        return;
      }

      const layoutImage: LayoutImage = await db.layout_images.findOne({
        where: { id: documentLayout.image_id }
      });

      if (!layoutImage || !layoutImage.image) {
        res
          .status(404)
          .json({ message: `Image for layout ID ${numericId} not found` });
        return;
      }

      res.setHeader("Content-Type", "image/png");
      res.status(200).send(layoutImage.image);

    } catch (error) {
      console.error("Error finding document layout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response) {

    try {
      // Extract the file and metadata

      const imageBuffer = req.file?.buffer;
      const metadataJson = req.body.metadata;

      if (!imageBuffer || !metadataJson) {
        res.status(400).json({ message: "Missing image or metadata" });
        return;
      }

      const metadata = JSON.parse(metadataJson);
      console.log("Parsed metadata: ", metadata);

      // Opcija za spremanje na disk za test
      // saveImageToDisk(imageFile).catch((error) => { console.error("Error saving image:", error) });

      const {
        name,
        fields,
        document_type,
        image_width,
        image_height
      } = metadata;

      if (!name || !fields || !document_type || !image_width || !image_height) {
        res.status(400).json({ message: "Missing required metadata fields" });
        return;
      }

      // 1. Spremamo sliku u layout_images tabelu
      const newLayoutImage: LayoutImage = await db.layout_images.create({
        image: imageBuffer.buffer,
        width: image_width,
        height: image_height
      });

      console.log("New layout image created with id:", newLayoutImage.id);

      // 2. Spremamo metadata u document_layouts tabelu s referencom na sliku
      const newDocumentLayout = await db.document_layouts.create({
        name: name,
        fields: typeof fields === 'string' ? fields : JSON.stringify(fields),
        document_type: document_type,
        image_id: newLayoutImage.id,
        image_width: image_width,
        image_height: image_height
      });

      console.log("New document layout created with id:", newDocumentLayout.id);

      res.status(201).json({
        message: "Layout saved successfully",
        layout_id: newDocumentLayout.id,
        image_id: newLayoutImage.id
      });

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

      // Prvo sačuvajmo ID slike
      const imageId = documentLayout.image_id;

      // Obrišimo document layout
      await db.document_layouts.destroy({ where: { id: numericId } });

      // Ako postoji slika, obrišimo i nju
      if (imageId) {
        await db.layout_images.destroy({ where: { id: imageId } });
      }

      res.json({
        message: `Document layout ${numericId} removed with its associated image`
      });

    } catch (error) {
      console.error("Error removing document layout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default DocumentLayoutsController;
