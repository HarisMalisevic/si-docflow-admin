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

    if (!jsonReq.token || jsonReq.token.trim() === "") {
      res.status(400).json({ message: "Token is required" });
      return;
    } else if (jsonReq.is_active === undefined || jsonReq.is_active === null) {
      res.status(400).json({ message: "Is_active is required" });
      return;
    } else if (!jsonReq.name || jsonReq.name.trim() === "") {
      res.status(400).json({ message: "Name is required" });
      return;
    } else if (!jsonReq.description || jsonReq.description.trim() === "") {
      res.status(400).json({ message: "Description is required" });
      return;
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

    if (jsonReq.token !== undefined) {
      if (!jsonReq.token || jsonReq.token.trim() === "") {
        res
          .status(400)
          .json({ message: "Token, if provided, cannot be empty." });
        return;
      }
    }
    if (jsonReq.is_active !== undefined) {
      if (jsonReq.is_active === null) {
        res
          .status(400)
          .json({ message: "Is_active, if provided, cannot be null." });
        return;
      }
    }
    if (jsonReq.name !== undefined) {
      if (!jsonReq.name || jsonReq.name.trim() === "") {
        res
          .status(400)
          .json({ message: "Name, if provided, cannot be empty." });
        return;
      }
    }
    if (jsonReq.description !== undefined) {
      if (jsonReq.description === null || jsonReq.description.trim() === "") {
        res
          .status(400)
          .json({ message: "Description, if provided, cannot be null." });
        return;
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
