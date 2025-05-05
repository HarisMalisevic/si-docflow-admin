import db from "../database/db";
import { Request, Response } from "express";
import ExternalAPIEndpoint from "../database/ExternalAPIEndpoint";
import { Optional } from "sequelize";

const authTypes = ["Basic", "Bearer", "API_Key", "OAuth", "None"] as const;
type AuthType = (typeof authTypes)[number];

interface APIEndpointAttributes {
  id: number;
  title?: string;
  description?: string;
  is_active: boolean;
  auth_type?: AuthType;
  auth_credentials?: string;
  method: string;
  base_url: string;
  route: string;
  query_parameters?: string;
  headers: string;
  body?: string;
  timeout_seconds: number;
  created_by: number;
  updated_by?: number;
}

type APIEndpointCreationAttributes = Optional<
  APIEndpointAttributes,
  | "id"
  | "title"
  | "description"
  | "auth_type"
  | "auth_credentials"
  | "query_parameters"
  | "body"
  | "updated_by"
>;

type APIEndpointUpdateAttributes =
  Partial<APIEndpointCreationAttributes>;

class APIEndpointsController {
  static async getAll(req: Request, res: Response) {
    try {
      const endpoints: ExternalAPIEndpoint[] =
        await db.external_api_endpoints.findAll();
      res.status(200).json(endpoints);
    } catch (error) {
      console.error("Error fetching external API endpoints: ", error);
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
      const endpoint = await db.external_api_endpoints.findOne({
        where: { id: numericId },
      });

      if (!endpoint) {
        res
          .status(404)
          .json({ message: `External API endpoint with ID ${id} not found.` });
          return;
      }
      res.status(200).json(endpoint);
    } catch (error) {
      console.error(
        `Error fetching external API endpoint with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response) {
    const jsonReq: APIEndpointCreationAttributes = req.body || {};

    const requiredFields: {
      key: keyof APIEndpointCreationAttributes;
      name: string;
    }[] = [
      { key: "is_active", name: "Is Active" },
      { key: "method", name: "Method" },
      { key: "base_url", name: "Base URL" },
      { key: "route", name: "Route" },
      { key: "headers", name: "Headers" },
      { key: "timeout_seconds", name: "Timeout Seconds" },
    ];

    for (const field of requiredFields) {
      if (jsonReq[field.key] === undefined || jsonReq[field.key] === null) {
        res.status(400).json({ message: `${field.name} is required` });
        return;
      }
    }

    const typeValidations: {
      key: keyof APIEndpointAttributes;
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
        key: "is_active",
        name: "Is Active",
        typeDescription: "boolean",
        isInvalid: (v) => typeof v !== "boolean",
      },
      {
        key: "auth_type",
        name: "Auth Type",
        typeDescription: `one of ${authTypes.join(", ")}`,
        isInvalid: (v) =>
          typeof v !== "string" || !authTypes.includes(v as AuthType),
      },
      {
        key: "auth_credentials",
        name: "Auth Credentials",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "method",
        name: "Method",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "base_url",
        name: "Base URL",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "route",
        name: "Route",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "query_parameters",
        name: "Query Parameters",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "headers",
        name: "Headers",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "body",
        name: "Body",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "timeout_seconds",
        name: "Timeout Seconds",
        typeDescription: "positive number",
        isInvalid: (v) => typeof v !== "number" || isNaN(v) || v <= 0,
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
      const newEndpoint = await db.external_api_endpoints.create({
        title: jsonReq.title,
        description: jsonReq.description,
        is_active: jsonReq.is_active,
        auth_type: jsonReq.auth_type,
        auth_credentials: jsonReq.auth_credentials,
        method: jsonReq.method,
        base_url: jsonReq.base_url,
        route: jsonReq.route,
        query_parameters: jsonReq.query_parameters,
        headers: jsonReq.headers,
        body: jsonReq.body,
        timeout_seconds: jsonReq.timeout_seconds,
        created_by: userID,
      });
      res.status(200).json(newEndpoint);
    } catch (error) {
      console.error("Error creating external API endpoint: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const jsonReq: APIEndpointUpdateAttributes = req.body || {};
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
      key: keyof APIEndpointAttributes;
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
        key: "is_active",
        name: "Is Active",
        typeDescription: "boolean",
        isInvalid: (v) => typeof v !== "boolean",
      },
      {
        key: "auth_type",
        name: "Auth Type",
        typeDescription: `one of ${authTypes.join(", ")}`,
        isInvalid: (v) =>
          typeof v !== "string" || !authTypes.includes(v as AuthType),
      },
      {
        key: "auth_credentials",
        name: "Auth Credentials",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "method",
        name: "Method",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "base_url",
        name: "Base URL",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "route",
        name: "Route",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "query_parameters",
        name: "Query Parameters",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "headers",
        name: "Headers",
        typeDescription: "non-empty string",
        isInvalid: (v) => typeof v !== "string" || v.trim() === "",
      },
      {
        key: "body",
        name: "Body",
        typeDescription: "string",
        isInvalid: (v) => typeof v !== "string",
      },
      {
        key: "timeout_seconds",
        name: "Timeout Seconds",
        typeDescription: "positive number",
        isInvalid: (v) => typeof v !== "number" || isNaN(v) || v <= 0,
      },
    ];

    for (const validation of typeValidations) {
      if (jsonReq[validation.key] !== undefined) {
        const value = jsonReq[validation.key];
        if (value === null) {
          const nullableFields: (keyof APIEndpointAttributes)[] = [
            "title",
            "description",
            "auth_type",
            "auth_credentials",
            "query_parameters",
            "body",
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

    const userID: number = (req.user as { id: number }).id;
    if (!userID || typeof userID !== "number") {
      res.status(401).json({ message: "Unauthorized or invalid user data" });
      return;
    }

    try {
      const endpoint = await db.external_api_endpoints.findOne({
        where: { id: numericId },
      });

      if (!endpoint) {
        res
          .status(404)
          .json({ message: `External API endpoint with ID ${id} not found.` });
          return;
      }

      const updateData = { ...jsonReq, updated_by: userID };

      endpoint.set(updateData);
      await endpoint.save();
      res.status(200).json(endpoint);
    } catch (error) {
      console.error(
        `Error updating external API endpoint with ID ${id}: `,
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
      const endpoint = await db.external_api_endpoints.findOne({
        where: { id: numericId },
      });

      if (!endpoint) {
        res
          .status(404)
          .json({ message: `External API endpoint with ID ${id} not found.` });
          return;
      }

      await db.external_api_endpoints.destroy({ where: { id: numericId } });
      res.json({ message: `External API endpoint with ID ${id} removed` });
    } catch (error) {
      console.error(
        `Error deleting external API endpoint with ID ${id}: `,
        error
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default APIEndpointsController;
