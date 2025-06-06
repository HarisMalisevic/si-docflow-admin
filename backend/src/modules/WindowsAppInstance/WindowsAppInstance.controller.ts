import DB from "../../database";
import { Request, Response } from "express";
import WindowsAppInstance, {
  OperationalMode,
} from "./WindowsAppInstance.model";
import { Optional } from "sequelize";

interface WindowsAppInstanceAttributes {
  id: number;
  title: string;
  location: string;
  machine_id: string;
  operational_mode: OperationalMode;
  polling_frequency: number;
  created_by?: number;
  updated_by?: number;
}

type WindowsAppInstanceCreationAttributes = Optional<
  WindowsAppInstanceAttributes,
  "id" | "created_by" | "updated_by"
>;

type WindowsAppInstanceUpdateAttributes = Partial<
  Omit<WindowsAppInstanceAttributes, "id" | "created_by">
>;

class WindowsAppInstanceController {
  static async getAll(req: Request, res: Response) {
    try {
      const instances: WindowsAppInstance[] =
        await DB.windows_app_instances.findAll();
      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching Windows app instances: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAllWithDevices(req: Request, res: Response) {
    try {
      const instances: WindowsAppInstance[] = await DB.windows_app_instances.findAll({
        include: [
            {
              model: DB.available_devices,
              as: "availableDevices",
              required: false,
              where: {
                is_chosen: true 
              }
            },
          ],
      });
      res.status(200).json(instances);
    } catch (error) {
      console.error("Error fetching Windows app instances & corresponding available devices: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getById(req: Request, res: Response) {
    const getByIdResult = await WindowsAppInstanceController.getByIdWithReturn(
      req
    );

    if (getByIdResult?.status === 200) {
      res.status(200).json(getByIdResult?.data);
    } else {
      res
        .status(getByIdResult?.status ?? 500)
        .json({ message: getByIdResult?.message ?? "Internal server error" });
    }
  }

  static async getByIdWithReturn(req: Request) {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return { status: 400, message: "Invalid ID format" };
    }

    try {
      const instance = await DB.windows_app_instances.findOne({
        where: { id: numericId },
      });

      if (!instance) {
        return {
          status: 404,
          message: `Windows app instance with ID ${id} not found.`,
        };
      }
      return { status: 200, data: instance };
    } catch (error) {
      console.error(
        `Error fetching Windows app instance with ID ${id}: `,
        error
      );
      return { status: 500, message: "Internal server error" };
    }
  }

  static async getByMachineId(req: Request, res: Response) {
    const { machine_id } = req.params;

    try {
      const instance = await DB.windows_app_instances.findOne({
        where: { machine_id: machine_id },
        include: [
            {
              model: DB.available_devices,
              as: "availableDevices",
              required: false,
              where: {
                is_chosen: true 
              }
            },
          ],
      });

      if (!instance) {
        res.status(404).json({
          message: `Windows app instance with machine ID ${machine_id} not found.`,
        });
        return;
      }
      res.status(200).json(instance);
    } catch (error) {
      console.error(
        `Error fetching Windows app instance with ID ${machine_id}: `,
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
      { key: "polling_frequency", name: "Polling frequency" },
    ];

    for (const field of requiredFields) {
      if (jsonReq[field.key] === undefined || jsonReq[field.key] === null) {
        res.status(400).json({ message: `${field.name} is required` });
        return;
      }
    }

    const typeValidations: {
      key: keyof WindowsAppInstanceAttributes;
      name: string;
      typeDescription: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isInvalid: (value: any) => boolean;
    }[] = [
      {
        key: "title",
        name: "Title",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "location",
        name: "Location",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "machine_id",
        name: "Machine ID",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "operational_mode",
        name: "Operational mode",
        typeDescription: `one of ${Object.values(OperationalMode).join(", ")}`,
        isInvalid: (v) =>
          !Object.values(OperationalMode).includes(v as OperationalMode),
      },
      {
        key: "polling_frequency",
        name: "Polling frequency",
        typeDescription: "non-negative integer",
        isInvalid: (v) =>
          typeof v !== "number" || !Number.isInteger(v) || v < 0,
      },
    ];

    for (const validation of typeValidations) {
      const value =
        jsonReq[validation.key as keyof WindowsAppInstanceCreationAttributes];
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
      const newInstance = await DB.windows_app_instances.create({
        title: jsonReq.title,
        location: jsonReq.location,
        machine_id: jsonReq.machine_id,
        operational_mode: jsonReq.operational_mode,
        polling_frequency: jsonReq.polling_frequency,
        created_by: userID,
      });

      res.status(201).json(newInstance);
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
      return;
    }

    const typeValidations: {
      key: keyof WindowsAppInstanceAttributes;
      name: string;
      typeDescription: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isInvalid: (value: any) => boolean;
    }[] = [
      {
        key: "title",
        name: "Title",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "location",
        name: "Location",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "machine_id",
        name: "Machine ID",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "operational_mode",
        name: "Operational mode",
        typeDescription: `one of ${Object.values(OperationalMode).join(", ")}`,
        isInvalid: (v) =>
          !Object.values(OperationalMode).includes(v as OperationalMode),
      },
      {
        key: "polling_frequency",
        name: "Polling frequency",
        typeDescription: "non-negative integer",
        isInvalid: (v) =>
          typeof v !== "number" || !Number.isInteger(v) || v < 0,
      },
    ];

    for (const validation of typeValidations) {
      const fieldKey =
        validation.key as keyof WindowsAppInstanceUpdateAttributes;
      if (jsonReq[fieldKey] !== undefined) {
        const value = jsonReq[fieldKey];
        const modelNullableFields: (keyof WindowsAppInstanceAttributes)[] = [
          "created_by",
          "updated_by",
        ];

        if (value === null) {
          if (!modelNullableFields.includes(validation.key)) {
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
      const instance = await DB.windows_app_instances.findOne({
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
      const deletedCount = await DB.windows_app_instances.destroy({
        where: { id: numericId },
      });

      if (deletedCount === 0) {
        res
          .status(404)
          .json({ message: `Windows app instance with ID ${id} not found` });
        return;
      }
      res.status(200).send();
    } catch (error) {
      console.error(
        `Error deleting Windows app instance with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async reportAvailableDevices(req: Request, res: Response) {
    const { machine_id } = req.params;
    const { devices: reportedDeviceNames } = req.body as { devices: string[] };

    if (
      !Array.isArray(reportedDeviceNames) ||
      !reportedDeviceNames.every(
        (name) => typeof name === "string" && name.trim() !== ""
      )
    ) {
      res.status(400).json({
        message:
          "Invalid devices format: expected an array of non-empty strings.",
      });
      return;
    }

    const transaction = await DB.sequelize.transaction();
    let instanceSuccessfullySynchronized = false;

    try {
      const instance = await DB.windows_app_instances.findOne({
        where: { machine_id: machine_id },
        transaction,
      });
      if (!instance) {
        await transaction.rollback();
        res
          .status(404)
          .json({ message: `Instance with machine ID ${machine_id} not found.` });
        return;
      }

      const instanceId = instance.id;
      const currentAvailableDevices = await DB.available_devices.findAll({
        where: { instance_id: instanceId },
        transaction,
      });
      const currentDeviceNamesMap = new Map(
        currentAvailableDevices.map((d: { device_name: any }) => [
          d.device_name,
          d,
        ])
      );

      for (const name of reportedDeviceNames) {
        if (!currentDeviceNamesMap.has(name)) {
          await DB.available_devices.create(
            {
              instance_id: instanceId,
              device_name: name,
              is_chosen: false,
            },
            { transaction }
          );
        }
      }

      for (const existingDevice of currentAvailableDevices) {
        if (!reportedDeviceNames.includes(existingDevice.device_name)) {
          await existingDevice.destroy({ transaction });
        }
      }

      await transaction.commit();
      instanceSuccessfullySynchronized = true;
      const updatedInstanceData = await DB.windows_app_instances.findByPk(
        instanceId,
        {
          include: [
            {
              model: DB.available_devices,
              as: "availableDevices",
              required: false,
            },
          ],
        }
      );
      res.status(200).json({
        message: "Available devices synchronized.",
        instance: updatedInstanceData,
      });
    } catch (error) {
      
      if(!instanceSuccessfullySynchronized) {
        await transaction.rollback();
      }

      console.error("Error reporting Available devices: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default WindowsAppInstanceController;
