import { Request, Response } from "express";
import DB from "../../database";
import AvailableDeviceModel from "./AvailableDevice.model";
import { OperationalMode } from "../WindowsAppInstance/WindowsAppInstance.model";

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
    const { instance_id } = req.params;
    const numericN = parseInt(instance_id, 10);

    if (isNaN(numericN) || numericN < 0) {
      res.status(400).json({
        message: `Available devices for App instance with ID ${instance_id} not found.`,
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
        `Error fetching available devices for App instance with ID ${instance_id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getChosenDeviceForInstance(req: Request, res: Response) {
    const { instance_id } = req.params;
    const numericInstanceId = parseInt(instance_id, 10);

    if (isNaN(numericInstanceId) || numericInstanceId < 0) {
      res.status(400).json({ message: "Invalid Windows app instance ID format." });
      return;
    }

    try {
      const instance = await DB.windows_app_instances.findByPk(numericInstanceId);
      if (!instance) {
          res.status(404).json({ message: `Windows app instance with ID ${instance_id} not found.` });
          return;
      }
      if (instance.operational_mode !== OperationalMode.HEADLESS) {
          res.status(400).json({ message: `Instance with ID ${instance_id} is not in HEADLESS mode: Cannot have a chosen device.` });
          return;
      }

      const chosenDevice = await DB.available_devices.findOne({
        where: {
          instance_id: numericInstanceId,
          is_chosen: true,
        },
      });

      if (!chosenDevice) {
        res.status(404).json({ message: `Available device for Windows app instance with ID ${instance_id} not found.` });
        return;
      }
      res.status(200).json(chosenDevice);
    } catch (error) {
      console.error(`Error fetching chosen device for a Windows app instance with ID ${instance_id}: `, error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async setChosenDeviceForInstance(req: Request, res: Response) {
    const { instance_id } = req.params;
    const { device_id } = req.body as { device_id?: number | null }; 

    const numericInstanceId = parseInt(instance_id, 10);
    
    let numericDeviceId: number | null | undefined = undefined; 

    if (isNaN(numericInstanceId) || numericInstanceId < 0) {
      res.status(400).json({ message: "Invalid instance ID format." });
      return;
    }

    if (device_id === undefined) {
        res.status(400).json({ message: "Device_id is required in the request body." });
        return;
    }

    if (device_id === null) {
        numericDeviceId = null; 
    } else {
        if (isNaN(device_id) || device_id < 0) {
            res.status(400).json({ message: "Invalid device ID format. Must be an integer or null." });
            return;
        }
        numericDeviceId = device_id;
    }


    const transaction = await DB.sequelize.transaction();
    try {
      const instance = await DB.windows_app_instances.findByPk(numericInstanceId, { transaction });
      if (!instance) {
        await transaction.rollback();
        res.status(404).json({ message: `Windows app instance with ID ${instance_id} not found.` });
        return;
      }

      if (instance.operational_mode !== OperationalMode.HEADLESS) {
        await transaction.rollback();
        res.status(400).json({
          message: `Windows app instance with ID ${instance_id} is not in HEADLESS mode: Cannot set a chosen device.`,
        });
        return;
      }

      // Set all devices for this instance to is_chosen = false
      await DB.available_devices.update(
        { is_chosen: false },
        {
          where: { instance_id: numericInstanceId },
          transaction,
        }
      );

      let chosenDevice: AvailableDeviceModel | null = null;
      // If a specific device_id is provided (not null) -> set it to is_chosen = true
      if (numericDeviceId !== null) {
        chosenDevice = await DB.available_devices.findOne({
          where: { id: numericDeviceId, instance_id: numericInstanceId }, 
          transaction,
        });

        if (!chosenDevice) {
          await transaction.rollback();
          res.status(404).json({
            message: `Available device with ID ${numericDeviceId} not found for instance ${instance_id}.`,
          });
          return;
        }
        await chosenDevice.update({ is_chosen: true }, { transaction });
      }

      await transaction.commit();
      if (chosenDevice) {
        res.status(200).json({ message: "Chosen device set successfully.", device: chosenDevice });
      } else {
        res.status(200).json({ message: "All devices for this instance are now un-chosen." });
      }

    } catch (error) {
      await transaction.rollback();
      console.error(`Error setting chosen device for instance ID ${instance_id}: `, error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default AvailableDeviceController;
