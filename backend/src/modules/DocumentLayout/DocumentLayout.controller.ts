import DB from "../../database";
import { Request, Response } from "express";
import DocumentLayout from "./DocumentLayout.model";
import DocumentType from "../DocumentType/DocumentType.model";
import LayoutImage from "modules/LayoutImage/LayoutImage";
import path from "path";
import fs from "fs/promises";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function saveImageToDisk(imageBuffer: Buffer, fileName_png: string) {
  const SAVE_LOCATION: string = path.join(__dirname, "../../uploads");

  // Ensure the directory exists
  await fs.mkdir(SAVE_LOCATION, { recursive: true });

  const imageFilePath: string = path.join(SAVE_LOCATION, `${fileName_png}.png`);
  console.log("Saving image to:", imageFilePath);

  // Save the image buffer to the local disk
  await fs.writeFile(imageFilePath, imageBuffer);
}

class DocumentLayoutsController {

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const allDocumentLayouts: DocumentLayout[] =
        await DB.document_layouts.findAll();

      //console.log("All document layouts: ", JSON.stringify(allDocumentLayouts));
      res.json(allDocumentLayouts);
    } catch (error) {
      console.error("Error fetching document layouts: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const layoutID: number = parseInt(id, 10);

    if (isNaN(layoutID)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    try {
      const documentLayout: DocumentLayout | null = await DB.document_layouts.findOne({
        where: { id: layoutID },
      });

      if (!documentLayout) {
        res
          .status(404)
          .json({ message: `Document layout with ID ${layoutID} not found` });
        return;
      }

      res.json(documentLayout);

    } catch (error) {
      console.error("Error finding document layout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getImageByLayoutId(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const layoutID: number = parseInt(id, 10);

    if (isNaN(layoutID)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    try {
      const documentLayout: DocumentLayout | null = await DB.document_layouts.findOne({
        attributes: ['image_id'], // Fetch only the image_id
        where: { id: layoutID },
      });


      if (!documentLayout || !documentLayout.image_id) {
        res
          .status(404)
          .json({ message: `Document layout with ID ${layoutID} not found` });
        return;
      }

      const layoutImage: LayoutImage | null = await DB.layout_images.findOne({
        where: { id: documentLayout.image_id }
      });

      if (!layoutImage || !layoutImage.image) {
        res
          .status(404)
          .json({ message: `Image for layout ID ${layoutID} not found` });
        return;
      }

      res.setHeader("Content-Type", "image/png");
      res.setHeader("X-Image-Width", layoutImage.width);
      res.setHeader("X-Image-Height", layoutImage.height);
      res.status(200).send(layoutImage.image);

    } catch (error) {
      console.error("Error finding document layout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {

    try {
      const userID: number = (req.user as { id: number }).id;

      // Extract the file and metadata

      const imageBuffer: Buffer<ArrayBufferLike> | undefined = req.file?.buffer;
      const metadataJson = req.body.metadata;

      if (!imageBuffer || !metadataJson) {
        res.status(400).json({ message: "Missing image or metadata" });
        return;
      }

      const metadata = JSON.parse(metadataJson);

      // For DEBUGGING purposes, you can save the image to disk
      // saveImageToDisk(imageBuffer, metadata.name).catch((error) => { console.error("Error saving image:", error) });

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

      // 0. Provjeravamo da li document_type već ima layout
      const documentType: DocumentType | null = await DB.document_types.findOne({
        where: { id: document_type },
      });

      if (!documentType) {
        res.status(404).json({ message: `Document type with ID ${document_type} not found` });
        return;
      }

      if (documentType.document_layout_id !== null) {
        res.status(400).json({ message: `Document type with ID ${document_type} already has a layout assigned` });
        return;
      }

      // 1. Spremamo sliku u layout_images tabelu
      const newLayoutImage: LayoutImage = await DB.layout_images.create({
        image: imageBuffer,
        width: image_width,
        height: image_height
      });

      console.log("New layout image created with id:", newLayoutImage.id);

      // 2. Spremamo metadata u document_layouts tabelu s referencom na sliku
      const newDocumentLayout: DocumentLayout = await DB.document_layouts.create({
        name: name,
        fields: fields,
        image_id: newLayoutImage.id,
        created_by: userID,
      });

      console.log("New document layout created with id:", newDocumentLayout.id);

      // 3. Ažuriramo document_types tabelu da referencira na novi layout
      const [numberOfUpdatedDocumentTypes] = await DB.document_types.update(
        { document_layout_id: newDocumentLayout.id },
        { where: { id: document_type } }
      );

      if (numberOfUpdatedDocumentTypes === 0) {
        console.error(`Failed to update document type with ID ${document_type}`);
        res.status(404).json({ message: `Document type with ID ${document_type} not found or could not be updated` });
        return;
      }

      console.log("Document type updated with new layout ID:", document_type);

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

  static async update(req: Request, res: Response): Promise<void> {

    const { id } = req.params;

    const userID: number = (req.user as { id: number }).id;

    if (!userID) {
      res.status(401).json({ message: "Unauthorized: User ID is missing" });
      return;
    }

    const layoutID: number = parseInt(id, 10);

    if (isNaN(layoutID)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    console.log("Update request for ID:", layoutID);

    try {
      const documentLayout: DocumentLayout | null = await DB.document_layouts.findOne({
        where: { id: layoutID },
      });

      if (!documentLayout) {
        res
          .status(404)
          .json({ message: `Document layout with ID ${layoutID} not found` });
        return;
      }

      const editedLayout = { // Must be plain object, not instance of DocumentLayout
        name: req.body.name || documentLayout.name,
        fields: req.body.fields || documentLayout.fields,
        image_id: documentLayout.image_id,
        updated_by: userID, // UserID of the user who made the changes
        // updatedAt is automatically set by Sequelize
      };

      // Update the document layout with the new data
      const [numberOfUpdatedDocumentLayouts] = await DB.document_layouts.update(editedLayout, {
        where: { id: layoutID },
      });

      if (numberOfUpdatedDocumentLayouts === 0) {
        console.error(`Failed to update document layout with ID ${layoutID}`);
        res.status(404).json({ message: `Document layout with ID ${layoutID} not found or could not be updated` });
        return;
      }

      console.log("Edited layout:", documentLayout.name);
      res.json({ message: `Document layout ${layoutID} updated` });

    } catch (error) {
      console.error("Error updating document layout:", error);
      res.status(500).json({ message: "Internal server error" });
    }


  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const layoutID: number = parseInt(id, 10);

    if (isNaN(layoutID)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    try {

      // Obrišimo document layout
      const numberOfDeletedDocumentLayouts = await DB.document_layouts.destroy({ where: { id: layoutID }, individualHooks: true });

      if (numberOfDeletedDocumentLayouts === 0) {
        console.error(`Failed to delete document layout with ID ${layoutID}`);
        res.status(404).json({ message: `Document layout with ID ${layoutID} not found or could not be deleted` });
        return;
      }

      // Zbog onDelete: 'SET NULL' u definiciji relacije, document_layout_id se prilikom brisanja layout-a automatski postavlja na null u odgovarajućem document type

      // Zbog afterDestroy hook na document_layouts, odgovarajuća slika se briše automatski

      res.json({
        message: `Document layout ${layoutID} removed with its associated image`
      });

    } catch (error) {
      console.error("Error removing document layout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default DocumentLayoutsController;
