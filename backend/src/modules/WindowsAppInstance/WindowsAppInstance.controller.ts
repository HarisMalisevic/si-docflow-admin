import DB from "../../database";
import { Request, Response } from "express";
import WindowsAppInstance, {
  OperationalMode,
  WindowsAppInstanceAttributes,
  WindowsAppInstanceCreationAttributes,
} from "./WindowsAppInstance.model";
import { Transaction, Sequelize } from "sequelize";
import AvailableDevice from "../AvailableDevice/AvailableDevice.model";

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

static async getById(req: Request, res: Response) {
    const getByIdResult =
      await WindowsAppInstanceController.getByIdWithReturn(req); 

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
        include: [ 
          { model: DB.available_devices, as: "chosenDevice", required: false },
          { model: DB.available_devices, as: "availableDevices", required: false },
        ],
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
          { model: DB.available_devices, as: "chosenDevice", required: false },
          {
            model: DB.available_devices,
            as: "availableDevices",
            required: false,
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
        chosen_device_id: null,
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

    if (isNaN(numericId) || numericId < 0) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    if (!jsonReq || Object.keys(jsonReq).length === 0) {
      res
        .status(400)
        .json({ message: "Request body cannot be empty for update" });
      return;
    }

    const userID: number = (req.user as { id: number })?.id;
    if (!userID || typeof userID !== "number") {
      res.status(401).json({ message: "Unauthorized or invalid user data" });
      return;
    }

    const transaction = await DB.sequelize.transaction();
    try {
      const instance = await DB.windows_app_instances.findOne({
        where: { id: numericId },
        transaction,
      });

      if (!instance) {
        await transaction.rollback();
        res
          .status(404)
          .json({ message: `Windows app instance with ID ${id} not found` });
        return;
      }

      const typeValidations: {
        key: keyof WindowsAppInstanceAttributes;
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
          typeDescription: `one of ${Object.values(OperationalMode).join(
            ", "
          )}`,
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
        {
          key: "chosen_device_id",
          name: "Chosen Device ID",
          typeDescription: "integer or null",
          isInvalid: (v) => typeof v !== "number" || !Number.isInteger(v),
        },
      ];

      for (const validation of typeValidations) {
        const fieldKey =
          validation.key as keyof WindowsAppInstanceUpdateAttributes;

        if (Object.prototype.hasOwnProperty.call(jsonReq, fieldKey)) {
          const value = jsonReq[fieldKey];
          const modelNullableFields: (keyof WindowsAppInstanceAttributes)[] = [
            "chosen_device_id",
            "created_by",
            "updated_by",
          ];

          if (value === null) {
            if (!modelNullableFields.includes(validation.key)) {
              await transaction.rollback();
              res.status(400).json({
                message: `${validation.name}, if provided, cannot be null.`,
              });
              return;
            }
          } else if (validation.isInvalid(value)) {
            await transaction.rollback();
            res.status(400).json({
              message: `${validation.name} must be a ${validation.typeDescription}`,
            });
            return;
          }
        }
      }

      const currentOpMode = instance.operational_mode;
      const newOpMode = jsonReq.operational_mode || currentOpMode;
      let newChosenDeviceId = jsonReq.chosen_device_id !== undefined ? jsonReq.chosen_device_id : instance.chosen_device_id;

      // check for HEADLESS mode
      if (jsonReq.chosen_device_id !== undefined) {
        if (
          newOpMode !== OperationalMode.HEADLESS &&
          jsonReq.chosen_device_id !== null
        ) {
          await transaction.rollback();
          res.status(400).json({
            message:
              "Cannot set a chosen device for an instance not in HEADLESS mode.",
          });
          return;
        }

        // check is Available device exists & if it belongs to this Windows app instance
        if (jsonReq.chosen_device_id !== null) {
          const deviceToChoose = await DB.available_devices.findOne({
            where: {
              id: jsonReq.chosen_device_id,
              instance_id: numericId,
            },
            transaction,
          });
          if (!deviceToChoose) {
            await transaction.rollback();
            res.status(400).json({
              message: `Available device with ID ${jsonReq.chosen_device_id} not found or does not belong to this instance.`,
            });
            return;
          }
          // Set ALL devices for this instance to is_chosen = false
          await DB.available_devices.update(
            { is_chosen: false },
            {
              where: { instance_id: numericId },
              transaction,
            }
          );

          // Set the specifically chosen device to is_chosen = true
          if (!deviceToChoose.is_chosen) {
             await deviceToChoose.update({ is_chosen: true }, { transaction });
          }

        } else { 
          // chosen_device_id is explicitly set to null -> set all devices for this instance to is_chosen = false
          await DB.available_devices.update(
            { is_chosen: false },
            {
              where: { instance_id: numericId },
              transaction,
            }
          );
          newChosenDeviceId = null;
        }
      }

      if (
        jsonReq.operational_mode === OperationalMode.STANDALONE &&
        currentOpMode === OperationalMode.HEADLESS &&
        instance.chosen_device_id !== null
      ) {
        const previouslyChosenDevice = await DB.available_devices.findByPk(
          instance.chosen_device_id,
          { transaction }
        );
        if (previouslyChosenDevice) {
          await previouslyChosenDevice.update(
            { is_chosen: false },
            { transaction }
          );
        }
        newChosenDeviceId = null;
      }

      const updateData = { ...jsonReq, updated_by: userID };
      if (
        jsonReq.chosen_device_id !== undefined ||
        (jsonReq.operational_mode === OperationalMode.STANDALONE &&
          currentOpMode === OperationalMode.HEADLESS)
      ) {
        updateData.chosen_device_id = newChosenDeviceId;
      }

      await instance.update(updateData, { transaction });
      await transaction.commit();

      const updatedInstance = await DB.windows_app_instances.findByPk(
        numericId,
        {
          include: [
            {
              model: DB.available_devices,
              as: "chosenDevice",
              required: false,
            },
            {
              model: DB.available_devices,
              as: "availableDevices",
              required: false,
            },
          ],
        }
      );
      res.status(200).json(updatedInstance);
    } catch (error) {
      await transaction.rollback();
      console.error(
        `Error updating Windows app instance with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
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
    const { instance_id } = req.params;
    const { devices: reportedDeviceNames } = req.body as {
      devices: string[];
    };

    const numericInstanceId = parseInt(instance_id, 10);

    if (isNaN(numericInstanceId) || numericInstanceId < 0) {
      res.status(400).json({ message: `Invalid instance ID format ${instance_id}` });
      return;
    }
    if (!Array.isArray(reportedDeviceNames) || !reportedDeviceNames.every(name => typeof name === 'string')) {
      res
        .status(400)
        .json({ message: "Invalid devices format; expected an array of strings." });
      return;
    }

    const transaction = await DB.sequelize.transaction();
    try {
      const instance = await DB.windows_app_instances.findByPk(
        numericInstanceId,
        { transaction }
      );
      if (!instance) {
        await transaction.rollback();
        res
          .status(404)
          .json({ message: `Windows app instance with ID ${instance_id} not found.` });
        return;
      }

      const currentAvailableDevices = await DB.available_devices.findAll({
        where: { instance_id: numericInstanceId },
        transaction,
      });
      const currentDeviceNamesMap = new Map(currentAvailableDevices.map((d: { device_name: any; }) => [d.device_name, d]));

      // Add new devices or update existing ones (though we mostly just care about existence here)
      for (const name of reportedDeviceNames) {
        if (!currentDeviceNamesMap.has(name)) {
          await DB.available_devices.create(
            {
              instance_id: numericInstanceId,
              device_name: name,
              is_chosen: false, 
            },
            { transaction }
          );
        }
      }

      // Devices to remove
      let chosenDeviceRemovedFlag = false;
      for (const existingDevice of currentAvailableDevices) {
        if (!reportedDeviceNames.includes(existingDevice.device_name)) {
          if (instance.chosen_device_id === existingDevice.id) {
            chosenDeviceRemovedFlag = true;
          }
          await existingDevice.destroy({ transaction });
        }
      }

      if (chosenDeviceRemovedFlag) {
        // The actively chosen device is no longer available.
        // Nullify chosen_device_id on the instance. is_chosen on the (now deleted) device is irrelevant.
        await instance.update({ chosen_device_id: null }, { transaction });
      }

      await transaction.commit();
      const updatedInstanceData = await DB.windows_app_instances.findByPk(numericInstanceId, {
        include: [
            { model: DB.available_devices, as: "chosenDevice", required: false },
            { model: DB.available_devices, as: "availableDevices", required: false },
        ]
      });
      res.status(200).json({ message: "Available devices synchronized.", instance: updatedInstanceData });
    } catch (error) {
      await transaction.rollback();
      console.error("Error reporting available devices: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default WindowsAppInstanceController;
