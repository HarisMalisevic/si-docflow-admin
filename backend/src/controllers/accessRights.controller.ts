import db from "../database/db";
import { Request, Response } from "express";
import AccessRight from "../database/AccessRight";

interface CreateAccessRights {
  token: string;
  is_active: boolean;
  name: string;
  description: string;
}

interface UpdateAccessRights extends Partial<CreateAccessRights> {}

class AccessRightsController {
  static async getAll(req: Request, res: Response) {
    try {
      const getAllAccessRights: AccessRight[] =
        await db.access_rights.findAll();
      res.json(getAllAccessRights);
    } catch (error) {
      console.error("Error fetching access rights: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const getAccessRightsById = await db.access_rights.findOne({
        where: { id },
      });
      if (!getAccessRightsById) {
        res
          .status(404)
          .json({ message: `Access rights for ID ${id} not found.` });
        return;
      }
      res.json(getAccessRightsById);
    } catch (error) {
      console.error(
        `Error fetching access rights for ID ${id} not found: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response) {
    const jsonReq: CreateAccessRights = req.body || {};

    const requiredFields: {
      key: keyof CreateAccessRights;
      name: string;
    }[] = [
      { key: "token", name: "Token" },
      { key: "is_active", name: "Is_active" },
      { key: "name", name: "Name" },
      { key: "description", name: "Description" },
    ];

    for (const field of requiredFields) {
      if (jsonReq[field.key] === undefined || jsonReq[field.key] === null) {
        res.status(400).json({ message: `${field.name} is required` });
        return;
      }
    }

    const validations: {
      key: keyof CreateAccessRights;
      name: string;
      typeDescription: string;
      isInvalid: (value: any) => boolean;
    }[] = [
      {
        key: "token",
        name: "Token",
        typeDescription: "non-empty string",
        isInvalid: (value) => typeof value !== "string" || value.trim() === "",
      },
      {
        key: "is_active",
        name: "Is_active",
        typeDescription: "boolean",
        isInvalid: (value) => typeof value !== "boolean",
      },
      {
        key: "name",
        name: "Name",
        typeDescription: "non-empty string",
        isInvalid: (value) => typeof value !== "string" || value.trim() === "",
      },
      {
        key: "description",
        name: "Description",
        typeDescription: "non-empty string",
        isInvalid: (value) => typeof value !== "string" || value.trim() === "",
      },
    ];
    for (const validation of validations) {
      const value = jsonReq[validation.key];
      if (validation.isInvalid(value)) {
        res.status(400).json({
          message: `${validation.name} must be a ${validation.typeDescription}`,
        });
        return;
      }
    }

    const userID: number = (req.user as { id: number }).id;

    try {
      await db.access_rights.create({
        token: jsonReq.token,
        is_active: jsonReq.is_active,
        name: jsonReq.name,
        description: jsonReq.description,
        created_by: userID,
      });
      res.status(200).json("Access rights created successfully!");
    } catch (error) {
      console.error("Error creating access rights: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;

    const jsonReq: UpdateAccessRights = req.body || {};

    if (!jsonReq || Object.keys(jsonReq).length === 0) {
      res
        .status(400)
        .json({ message: "Request body cannot be empty for update." });
      return;
    }
    const typeValidations: {
      key: keyof UpdateAccessRights;
      name: string;
      typeDescription: string;
      isInvalid: (value: any) => boolean;
    }[] = [
      {
        key: "token",
        name: "Token",
        typeDescription: "non-empty string",
        isInvalid: (value) => typeof value !== "string" || value.trim() === "",
      },
      {
        key: "is_active",
        name: "Is_active",
        typeDescription: "boolean",
        isInvalid: (value) => typeof value !== "boolean",
      },
      {
        key: "name",
        name: "Name",
        typeDescription: "non-empty string",
        isInvalid: (value) => typeof value !== "string" || value.trim() === "",
      },
      {
        key: "description",
        name: "Description",
        typeDescription: "non-empty string",
        isInvalid: (value) => typeof value !== "string" || value.trim() === "",
      },
    ];

    for (const validation of typeValidations) {
      if (jsonReq[validation.key] !== undefined) {
        const value = jsonReq[validation.key];
        if (value === null) {
          if (
            validation.key === "is_active" ||
            validation.key === "token" ||
            validation.key === "name" ||
            validation.key === "description"
          ) {
            res.status(400).json({
              message: `${validation.name}, if provided, cannot be null.`,
            });
            return;
          }
        }

        if (validation.isInvalid(value)) {
          res.status(400).json({
            message: `${validation.name} must be a ${validation.typeDescription}`,
          });
          return;
        }
      }
    }

    try {
      const accessRightsWithId = await db.access_rights.findOne({
        where: { id },
      });

      if (!accessRightsWithId) {
        res
          .status(404)
          .json({ message: `Access rights with ID ${id} not found.` });
        return;
      }

      accessRightsWithId.set(jsonReq);

      await accessRightsWithId.save();
      res.status(200).json(accessRightsWithId);
    } catch (error) {
      console.error(`Error updating access rights with ID ${id}: `, error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const accessRightsWithId = await db.access_rights.findOne({
        where: { id },
      });

      if (!accessRightsWithId) {
        res
          .status(404)
          .json({ message: `Access rights with ID ${id} not found.` });
        return;
      }

      await db.access_rights.destroy({ where: { id: id } });
      res.json({ message: `Access rights with ID ${id} removed` });
    } catch (error) {
      console.error(`Error removing access rights with ID ${id}: `, error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default AccessRightsController;
