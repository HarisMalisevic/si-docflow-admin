import { Request, Response } from "express";
import DB from "../../database";
import AvailableDeviceModel, {
  AvailableDeviceAttributes,
  AvailableDeviceCreationAttributes,
  AvailableDeviceUpdateAttributes,
} from "./AvailableDevice.model";

class AvailableDeviceController {
  static async getAll(req: Request, res: Response) {
    try {
      const devices: AvailableDeviceModel[] =
        await DB.available_devices.findAll();
      res.status(200).json(devices);
    } catch (error) {
      console.error("Error fetching available devices: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const numericN = parseInt(id, 10);

    if (isNaN(numericN) || numericN < 0) {
      res
        .status(400)
        .json({ message: `Available device with ID ${id} not found.` });
      return;
    }

    try {
      const device: AvailableDeviceModel = await DB.available_devices.findOne({
        where: { id: numericN },
      });
      if (!device) {
        res
          .status(404)
          .json({ message: `Available device with ID ${id} not found.` });
        return;
      }
      res.status(200).json(device);
    } catch (error) {
      console.error(`Error fetching available device with ID ${id}: `, error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getByAppInstanceId(req: Request, res: Response) {
    const { id } = req.params;
    const numericN = parseInt(id, 10);

    if (isNaN(numericN)) {
      res.status(400).json({
        message: `Available devices for App instance with ID ${id} not found.`,
      });
      return;
    }

    try {
      const devices: AvailableDeviceModel[] =
        await DB.available_devices.findAll({
          where: { instance_id: numericN },
        });
      res.status(200).json(devices);
    } catch (error) {
      console.error(
        `Error fetching available devices for App instance with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response) {
    const jsonReq: AvailableDeviceCreationAttributes = req.body || {};

    const requiredFields: {
      key: keyof AvailableDeviceCreationAttributes;
      name: string;
    }[] = [
      { key: "instance_id", name: "Instance ID" },
      { key: "device_name", name: "Device name" },
      { key: "is_chosen", name: "Is chosen" },
    ];

    for (const field of requiredFields) {
      if (jsonReq[field.key] === undefined || jsonReq[field.key] === null) {
        res.status(400).json({ message: `${field.name} is required` });
        return;
      }
    }

    const typeValidations: {
      key: keyof AvailableDeviceCreationAttributes;
      name: string;
      typeDescription: string;
      isInvalid: (value: any) => boolean;
    }[] = [
      {
        key: "instance_id",
        name: "Instance ID",
        typeDescription: "non-negative integer",
        isInvalid: (v) =>
          typeof v !== "number" || !Number.isInteger(v) || v < 0,
      },
      {
        key: "device_name",
        name: "Device name",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "is_chosen",
        name: "Is chosen",
        typeDescription: "boolean",
        isInvalid: (v) => typeof v !== "boolean",
      },
    ];

    for (const validation of typeValidations) {
      const value =
        jsonReq[validation.key as keyof AvailableDeviceCreationAttributes];
      if (value !== undefined && value !== null) {
        if (validation.isInvalid(value)) {
          res.status(400).json({
            message: `${validation.name} must be a ${validation.typeDescription}`,
          });
          return;
        }
      } else if (requiredFields.some((rf) => rf.key === validation.key)) {
        res.status(400).json({
          message: `${validation.name} is required and has an invalid type or is missing.`,
        });
        return;
      }
    }

    const userID: number = (req.user as { id: number })?.id;
    if (!userID || typeof userID !== "number") {
      res.status(401).json({ message: "Unauthorized or invalid user data" });
      return;
    }

    try {
      const newDevice = await DB.available_devices.create({
        instance_id: jsonReq.instance_id,
        device_name: jsonReq.device_name,
        is_chosen: jsonReq.is_chosen,
        created_by: userID,
      });

      res.status(201).json(newDevice);
    } catch (error) {
      console.error("Error creating Available device: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const jsonReq: AvailableDeviceUpdateAttributes = req.body || {};
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    if (!jsonReq || Object.keys(jsonReq).length === 0) {
      res
        .status(400)
        .json({ message: "Request body cannot be empty for update" });
      return;
    }

    const typeValidations: {
      key: keyof AvailableDeviceUpdateAttributes;
      name: string;
      typeDescription: string;
      isInvalid: (value: any) => boolean;
    }[] = [
      {
        key: "device_name",
        name: "Device name",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "is_chosen",
        name: "Is chosen",
        typeDescription: "boolean",
        isInvalid: (v) => typeof v !== "boolean",
      },
    ];

    for (const validation of typeValidations) {
      if (jsonReq[validation.key] !== undefined) {
        const value = jsonReq[validation.key];
        if (value === null) {
          res.status(400).json({
            message: `${validation.name}, if provided, cannot be null.`,
          });
          return;
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
      const device = await DB.available_devices.findOne({
        where: { id: numericId },
      });

      if (!device) {
        res
          .status(404)
          .json({ message: `Available device with ID ${id} not found` });
        return;
      }

      const updateData = { ...jsonReq, updated_by: userID };
      device.set(updateData);
      await device.save();
      res.status(200).json(device);
    } catch (error) {
      console.error(`Error updating Available device with ID ${id}: `, error);
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
      const deletedCount = await DB.available_devices.destroy({
        where: { id: numericId },
      });

      if (deletedCount === 0) {
        res
          .status(404)
          .json({ message: `Available device with ID ${id} not found` });
        return;
      }
      res.status(200).send();
    } catch (error) {
      console.error(`Error deleting Available devices with ID ${id}: `, error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default AvailableDeviceController;
