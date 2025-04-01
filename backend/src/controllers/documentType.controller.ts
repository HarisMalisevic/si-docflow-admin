import { Request, Response } from "express";

class DocumentTypeController {
  static getAll(req: Request, res: Response) {
    // Fetch document types from database
    res.json({ message: "List of document types" });
  }

  static create(req: Request, res: Response) {
    // Add a new document type to the database
    res.status(201).json({ message: "Document type added" });
  }

  static remove(req: Request, res: Response) {
    const { id } = req.params;
    // Remove the document type from the database
    res.json({ message: `Document type ${id} removed` });
  }
}

export default DocumentTypeController;
