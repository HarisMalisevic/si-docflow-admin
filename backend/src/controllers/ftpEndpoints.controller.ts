import db from "../database/db";
import { Request, Response } from "express";
import ExternalFTPEndpoint from "../database/ExternalFTPEndpoint";
import { Optional } from "sequelize";

interface FTPEndpointAttributes {
  id: number;
  title?: string;
  description?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  path: string;
  created_by: number;
  updated_by?: number;
}

type FTPEndpointCreationAttributes = Optional<
  FTPEndpointAttributes,
  | "id"
  | "title"
  | "description"
  | "port"
  | "username"
  | "password"
  | "secure"
  | "updated_by"
>;


type FTPEndpointUpdateAttributes =
  Partial<FTPEndpointCreationAttributes>;

class FTPEndpointsController {
  static async getAll(req: Request, res: Response) {
    try {
      const endpoints: ExternalFTPEndpoint[] =
        await db.external_ftp_endpoints.findAll();
      res.status(200).json(endpoints);
    } catch (error) {
      console.error("Error fetching external FTP endpoints: ", error);
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
      const endpoint = await db.external_ftp_endpoints.findOne({
        where: { id: numericId },
      });

      if (!endpoint) {
        res
          .status(404)
          .json({ message: `External FTP endpoint with ID ${id} not found.` });
        return;
      }
      res.status(200).json(endpoint);
    } catch (error) {
      console.error(
        `Error fetching external FTP endpoint with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response) {
    const jsonReq: FTPEndpointCreationAttributes = req.body || {};

    const requiredFields: {
      key: keyof FTPEndpointCreationAttributes;
      name: string;
    }[] = [
      { key: "host", name: "Host" },
      { key: "path", name: "Path" },
    ];

    for (const field of requiredFields) {
      if (jsonReq[field.key] === undefined || jsonReq[field.key] === null) {
        res.status(400).json({ message: `${field.name} is required` });
        return;
      }
    }

    const typeValidations: {
      key: keyof FTPEndpointAttributes;
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
        key: "description",
        name: "Description",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "host",
        name: "Host",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "port",
        name: "Port",
        typeDescription: "positive integer",
        isInvalid: (v) => !Number.isInteger(v) || v <= 0,
      },
      {
        key: "username",
        name: "Username",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "password",
        name: "Password",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "secure",
        name: "Secure",
        typeDescription: "boolean",
        isInvalid: (v) => typeof v !== "boolean",
      },
      {
        key: "path",
        name: "Path",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
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

    const userID: number = (req.user as { id: number })?.id;
    if (!userID || typeof userID !== "number") {
      res.status(401).json({ message: "Unauthorized or invalid user data" });
      return;
    }

    try {
      const newEndpoint = await db.external_ftp_endpoints.create({
        title: jsonReq.title,
        description: jsonReq.description,
        host: jsonReq.host,
        port: jsonReq.port,
        username: jsonReq.username,
        password: jsonReq.password,
        secure: jsonReq.secure,
        path: jsonReq.path,
        created_by: userID,
      });
      res.status(201).json(newEndpoint);
    } catch (error) {
      console.error("Error creating external FTP endpoint: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const jsonReq: FTPEndpointUpdateAttributes = req.body || {};
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
      key: keyof FTPEndpointAttributes;
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
        key: "description",
        name: "Description",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "host",
        name: "Host",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "port",
        name: "Port",
        typeDescription: "positive integer",
        isInvalid: (v) => !Number.isInteger(v) || v <= 0,
      },
      {
        key: "username",
        name: "Username",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "password",
        name: "Password",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "secure",
        name: "Secure",
        typeDescription: "boolean",
        isInvalid: (v) => typeof v !== "boolean",
      },
      {
        key: "path",
        name: "Path",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
    ];

    for (const validation of typeValidations) {
      if (jsonReq[validation.key] !== undefined) {
        const value = jsonReq[validation.key];
        if (value === null) {
          const nullableFields: (keyof FTPEndpointAttributes)[] = [
            "title",
            "description",
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
      const endpoint = await db.external_ftp_endpoints.findOne({
        where: { id: numericId },
      });

      if (!endpoint) {
        res
          .status(404)
          .json({ message: `External FTP endpoint with ID ${id} not found.` });
        return;
      }

      const updateData = { ...jsonReq, updated_by: userID };
      endpoint.set(updateData);
      await endpoint.save();
      res.status(200).json(endpoint);
    } catch (error) {
      console.error(
        `Error updating external FTP endpoint with ID ${id}: `,
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
      const endpoint = await db.external_ftp_endpoints.findOne({
        where: { id: numericId },
      });

      if (!endpoint) {
        res
          .status(404)
          .json({ message: `External FTP endpoint with ID ${id} not found.` });
        return;
      }

      await db.external_ftp_endpoints.destroy({ where: { id: numericId } });
      res.json({ message: `External FTP endpoint with ID ${id} removed` });
    } catch (error) {
      console.error(
        `Error deleting external FTP endpoint with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default FTPEndpointsController;
