import db from "../database/db";
import { Request, Response } from "express";
import WindowsAppInstance from "../database/WindowsAppInstance";
import { Optional } from "sequelize";

interface WindowsAppInstanceAttributes {
  id: number;
  title: string;
  location: string;
  machine_id: string;
  operational_mode: string;
  auto_start_behavior: string;
  polling_frequency: number;
  security_keys: string;
  created_by?: number;
  updated_by?: number;
}

type WindowsAppInstanceCreationAttributes = Optional<
  WindowsAppInstanceAttributes,
  "id" | "updated_by"
>;

type WindowsAppInstanceUpdateAttributes = Partial<WindowsAppInstanceAttributes>;

class WindowsAppInstanceController {
  static async getAll(req: Request, res: Response) {
    try {
      const instances: WindowsAppInstance[] =
        await db.windows_app_instances.findAll();
      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching Windows app instances: ", error);
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
      const instance = await db.windows_app_instances.findOne({
        where: { id: numericId },
      });

      if (!instance) {
        res
          .status(404)
          .json({ message: `Windows app instance with ID ${id} not found.` });
        return;
      }
      res.status(200).json(instance);
    } catch (error) {
      console.error(
        `Error fetching Windows app instance with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response) {
    const jsonReq: WindowsAppInstanceCreationAttributes = req.body || {};

    const requiredFields: {
      key: keyof WindowsAppInstanceCreationAttributes;
      name: string;
    }[] = [
      { key: "title", name: "Title" },
      { key: "location", name: "Location" },
      { key: "machine_id", name: "Machine ID" },
      { key: "operational_mode", name: "Operational mode" },
      { key: "auto_start_behavior", name: "Auto start behavior" },
      { key: "polling_frequency", name: "Polling frequency" },
      { key: "security_keys", name: "Security keys" },
    ];

    for (const field of requiredFields) {
      if (jsonReq[field.key] === undefined || jsonReq[field.key] === null) {
        res.status(400).json({ message: `${field.name} is required` });
        return;
      }
    }

    const typeValidations: {
      key: keyof WindowsAppInstanceCreationAttributes;
      name: string;
      typeDescription: string;
      isInvalid: (value: any) => boolean;
    }[] = [
      {
        key: "title",
        name: "Title",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "location",
        name: "Location",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "machine_id",
        name: "Machine ID",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "operational_mode",
        name: "Operational mode",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "auto_start_behavior",
        name: "Auto start behavior",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "polling_frequency",
        name: "Polling frequency",
        typeDescription: "integer",
        isInvalid: (v) => typeof v !== "number" || !Number.isInteger(v),
      },
      {
        key: "security_keys",
        name: "Security keys",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
    ];

    for (const validation of typeValidations) {
      const value = jsonReq[validation.key];
      if (value !== undefined && value !== null) {
        if (validation.isInvalid(value)) {
          res.status(400).json({
            message: `${validation.name} must be a ${validation.typeDescription}`,
          });
          return;
        }
      }
    }

    const userID: number = (req.user as { id: number }).id;
    if (!userID || typeof userID !== "number") {
      res.status(400).json({ message: "Unauthorized or invalid user data" });
      return;
    }

    try {
      const newInstance = await db.windows_app_instances.create({
        title: jsonReq.title,
        location: jsonReq.location,
        machine_id: jsonReq.machine_id,
        operational_mode: jsonReq.operational_mode,
        auto_start_behavior: jsonReq.auto_start_behavior,
        polling_frequency: jsonReq.polling_frequency,
        security_keys: jsonReq.security_keys,
        created_by: userID,
      });

      res.status(200).json(newInstance);
    } catch (error) {
      console.error("Error creating Windows App Instance: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const jsonReq: WindowsAppInstanceUpdateAttributes = req.body || {};
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    if (!jsonReq || Object.keys(jsonReq).length === 0) {
      res
        .status(400)
        .json({ message: "Request body cannot be empty for update" });
    }

    const typeValidations: {
      key: keyof WindowsAppInstanceCreationAttributes;
      name: string;
      typeDescription: string;
      isInvalid: (value: any) => boolean;
    }[] = [
      {
        key: "title",
        name: "Title",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "location",
        name: "Location",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "machine_id",
        name: "Machine ID",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "operational_mode",
        name: "Operational mode",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "auto_start_behavior",
        name: "Auto start behavior",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "polling_frequency",
        name: "Polling frequency",
        typeDescription: "integer",
        isInvalid: (v) => typeof v !== "number" || !Number.isInteger(v),
      },
      {
        key: "security_keys",
        name: "Security keys",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
    ];

    for (const validation of typeValidations) {
      if (jsonReq[validation.key] !== undefined) {
        const value = jsonReq[validation.key];
        const isNullable = validation.key === "updated_by";

        if (value === null) {
          if (!isNullable) {
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

    const userID: number = (req.user as { id: number }).id;
    if (!userID || typeof userID !== "number") {
      res.status(401).json({ message: "Unauthorized or invalid user data" });
      return;
    }

    try {
      const instance = await db.windows_app_instances.findOne({
        where: { id: numericId },
      });

      if (!instance) {
        res
          .status(404)
          .json({ message: `Windows app instance with ID ${id} not found` });
        return;
      }

      const updateData = { ...jsonReq, updated_by: userID };
      instance.set(updateData);
      await instance.save();
      res.status(200).json(instance);
    } catch (error) {
      console.error(
        `Error updating Windows app instance with ID ${id}: `,
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
      const instance = await db.windows_app_instances.findOne({
        where: { id: numericId },
      });

      if (!instance) {
        res
          .status(404)
          .json({ message: `Windows app instance with ID ${id} not found` });
        return;
      }
      await db.windows_app_instances.destroy({ where: { id: numericId } });
      res.json({ message: `Windows app instance with ID ${id} removed` });
    } catch (error) {
      console.error(
        `Error deleting Windows app instance with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default WindowsAppInstanceController;
