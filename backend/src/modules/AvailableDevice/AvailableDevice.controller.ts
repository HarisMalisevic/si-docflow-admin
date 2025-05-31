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
}

export default AvailableDeviceController;
