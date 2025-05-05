import db from "../database/db";
import { Request, Response } from "express";
import LocalStorageFolder from "../database/LocalStorageFolder";
import { Optional } from "sequelize";

interface LocalStorageFolderAttributes {
  id: number;
  title: string;
  description: string;
  path: string;
  is_active: boolean;
  created_by: number;
  updated_by?: number;
}

type LocalStorageFolderCreationAttributes = Optional<
  LocalStorageFolderAttributes,
  "id" | "is_active" | "updated_by"
>;

type LocalStorageFolderUpdateAttributes =
  Partial<LocalStorageFolderCreationAttributes>;

class LocalStorageFoldersController {
  static async getAll(req: Request, res: Response) {
    try {
      const folders: LocalStorageFolder[] =
        await db.local_storage_folders.findAll();
      res.status(200).json(folders);
    } catch (error) {
      console.error("Error fetching local storage folders: ", error);
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
      const folder = await db.local_storage_folders.findOne({
        where: { id: numericId },
      });

      if (!folder) {
        res
          .status(404)
          .json({ message: `Local storage folder with ID ${id} not found.` });
        return;
      }
      res.status(200).json(folder);
    } catch (error) {
      console.error(
        `Error fetching local storage folder with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response) {
    const jsonReq: LocalStorageFolderCreationAttributes = req.body || {};

    const requiredFields: {
      key: keyof LocalStorageFolderCreationAttributes;
      name: string;
    }[] = [
      { key: "title", name: "Title" },
      { key: "description", name: "Description" },
      { key: "path", name: "Path" },
    ];

    for (const field of requiredFields) {
      if (jsonReq[field.key] === undefined || jsonReq[field.key] === null) {
        res.status(400).json({ message: `${field.name} is required` });
        return;
      }
    }

    const typeValidations: {
      key: keyof LocalStorageFolderAttributes;
      name: string;
      typeDescription: string;
      isInvalid: (value: any) => boolean;
    }[] = [
      {
        key: "title",
        name: "Title",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "description",
        name: "Description",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "path",
        name: "Path",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "is_active",
        name: "Is Active",
        typeDescription: "boolean",
        isInvalid: (v) => typeof v !== "boolean",
      },
    ];

    for (const validation of typeValidations) {
      const value = jsonReq[validation.key];
      if (validation.key === "is_active") {
        if (
          value !== undefined &&
          value !== null &&
          validation.isInvalid(value)
        ) {
          res.status(400).json({
            message: `${validation.name} must be a ${validation.typeDescription}`,
          });
          return;
        }
      } else {
        if (validation.isInvalid(value)) {
          res.status(400).json({
            message: `${validation.name} must be a ${validation.typeDescription}`,
          });
          return;
        }
      }
    }

    const userID: number = (req.user as { id: number })?.id;
    if (!userID || typeof userID !== "number") {
      res.status(401).json({ message: "Unauthorized or invalid user data" });
      return;
    }

    try {
      const newFolder = await db.local_storage_folders.create({
        title: jsonReq.title,
        description: jsonReq.description,
        path: jsonReq.path,
        is_active: jsonReq.is_active, 
        created_by: userID,
      });
      res.status(201).json(newFolder);
    } catch (error) {
      console.error("Error creating local storage folder: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const jsonReq: LocalStorageFolderUpdateAttributes = req.body || {};
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }
    if (!jsonReq || Object.keys(jsonReq).length === 0) {
      res
        .status(400)
        .json({ message: "Request body cannot be empty for update." });
      return;
    }

    const typeValidations: {
      key: keyof LocalStorageFolderAttributes;
      name: string;
      typeDescription: string;
      isInvalid: (value: any) => boolean;
    }[] = [
      {
        key: "title",
        name: "Title",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "description",
        name: "Description",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "path",
        name: "Path",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "is_active",
        name: "Is Active",
        typeDescription: "boolean",
        isInvalid: (v) => typeof v !== "boolean",
      },
    ];

    for (const validation of typeValidations) {
      if (jsonReq[validation.key] !== undefined) {
        const value = jsonReq[validation.key];
        if (value === null) {
          const nullableFields: (keyof LocalStorageFolderAttributes)[] = [
            "updated_by",
          ];
          if (!nullableFields.includes(validation.key)) {
            res.status(400).json({
              message: `${validation.name}, if provided, cannot be null.`,
            });
            return;
          }
        } else if (validation.isInvalid(value)) {
          res.status(400).json({
            message: `${validation.name} must be a ${validation.typeDescription}`,
          });
          return;
        }
      }
    }

    const userID: number = (req.user as { id: number })?.id;
    if (!userID || typeof userID !== "number") {
      res.status(401).json({ message: "Unauthorized or invalid user data" });
      return;
    }

    try {
      const folder = await db.local_storage_folders.findOne({
        where: { id: numericId },
      });

      if (!folder) {
        res
          .status(404)
          .json({ message: `Local storage folder with ID ${id} not found.` });
        return;
      }

      const updateData = { ...jsonReq, updated_by: userID };
      folder.set(updateData);
      await folder.save();
      res.status(200).json(folder);
    } catch (error) {
      console.error(
        `Error updating local storage folder with ID ${id}: `,
        error
      );
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    try {
      const folder = await db.local_storage_folders.findOne({
        where: { id: numericId },
      });

      if (!folder) {
        res
          .status(404)
          .json({ message: `Local storage folder with ID ${id} not found.` });
        return;
      }

      await db.local_storage_folders.destroy({ where: { id: numericId } });
      res.json({ message: `Local storage folder with ID ${id} removed` });
    } catch (error) {
      console.error(
        `Error deleting local storage folder with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default LocalStorageFoldersController;
