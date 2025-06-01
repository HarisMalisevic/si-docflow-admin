import DB from "../../database";
import { Request, Response } from "express";
import ExternalAPIEndpoint from "./ExternalAPIEndpoint.model";
import { Optional } from "sequelize";

interface APIEndpointAttributes {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
  method: string;
  base_url: string;
  route: string;
  params: string;
  headers: string;
  timeout: number;
  created_by?: number;
  updated_by?: number;
}

type APIEndpointCreationAttributes = Optional<
  APIEndpointAttributes,
  | "id"
  | "description"
  | "created_by"
  | "updated_by"
>;

type APIEndpointUpdateAttributes = Partial<APIEndpointCreationAttributes>;

class APIEndpointsController {
  static async getAll(req: Request, res: Response) {
    try {
      const endpoints: ExternalAPIEndpoint[] =
        await DB.external_api_endpoints.findAll();
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
      const endpoint = await DB.external_api_endpoints.findOne({
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
        { key: "title", name: "Title" },
        { key: "is_active", name: "Is Active" },
        { key: "method", name: "Method" },
        { key: "base_url", name: "Base URL" },
        { key: "route", name: "Route" },
        { key: "params", name: "Query Parameters" },
        { key: "headers", name: "Headers" },
        { key: "timeout", name: "Timeout" },
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          key: "params",
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
          key: "timeout",
          name: "Timeout",
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

    let userID: number | null = null;
    if (req.user) {
      userID = (req.user as { id: number }).id;
      if (!userID || typeof userID !== "number") {
        res.status(400).json({ message: "Unauthorized or invalid user data" });
        return;
      }
    }

    try {
      const newEndpoint = await DB.external_api_endpoints.create({
        title: jsonReq.title,
        description: jsonReq.description,
        is_active: jsonReq.is_active,
        method: jsonReq.method,
        base_url: jsonReq.base_url,
        route: jsonReq.route,
        params: jsonReq.params,
        headers: jsonReq.headers,
        timeout: jsonReq.timeout,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          key: "params",
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
          key: "timeout",
          name: "Timeout",
          typeDescription: "positive number",
          isInvalid: (v) => typeof v !== "number" || isNaN(v) || v <= 0,
        },
      ];

    for (const validation of typeValidations) {
      if (jsonReq[validation.key] !== undefined) {
        const value = jsonReq[validation.key];
        if (value === null) {
          const nullableFields: (keyof APIEndpointAttributes)[] = [
            "description",
            "created_by",
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

    let userID: number | null = null;
    if (req.user) {
      userID = (req.user as { id: number }).id;
      if (!userID || typeof userID !== "number") {
        res.status(400).json({ message: "Unauthorized or invalid user data" });
        return;
      }
    }

    try {
      const endpoint = await DB.external_api_endpoints.findOne({
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
      const endpoint = await DB.external_api_endpoints.findOne({
        where: { id: numericId },
      });

      if (!endpoint) {
        res
          .status(404)
          .json({ message: `External API endpoint with ID ${id} not found.` });
        return;
      }

      await DB.external_api_endpoints.destroy({ where: { id: numericId } });
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
