import db from "../database/db";
import { Request, Response } from "express";

class SsoProviderController {
  static async getAllSSOProviders(req: Request, res: Response) {
    try {
      const allSSOProviders: {
        name: string;
        client_id: string;
        client_secret: string;
        callback_url: string;
      }[] = await db.sso_providers.findAll();
      if (!allSSOProviders) {
        throw new Error("No SSO providers found in the database!");
      }
      res.json(allSSOProviders);
    } catch (error) {
      console.error("Error fetching SSO providers: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async addSSOProvider(req: Request, res: Response) {
    const jsonReq: {
      name: string;
      client_id: string;
      client_secret: string;
      callback_url: string;
    } = req.body || {};

    if (!jsonReq.name) {
      res.status(400).json({ message: "Name is required" });
      return;
    } else if (!jsonReq.client_id) {
      res.status(400).json({ message: "Client_id is required" });
      return;
    } else if (!jsonReq.client_secret) {
      res.status(400).json({ message: "Client_secret is required" });
      return;
    } else if (!jsonReq.callback_url) {
      res.status(400).json({ message: "Callback_url is required" });
      return;
    }

    try {
      await db.sso_providers.create({
        name: jsonReq.name,
        client_id: jsonReq.client_id,
        client_secret: jsonReq.client_secret,
        callback_url: jsonReq.callback_url,
      });
      res.status(200).json({ message: "SSO provider added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add SSO provider", error });
    }
  }

  static async deleteSSOProvider(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const SSO_provider = await db.sso_providers.findOne({ where: { id } });

      if (!SSO_provider) {
        res.status(404).json({ message: `SSO provider with ID ${id} not found` });
        return;
      }

      await db.sso_providers.destroy({ where: { id } });
    } catch (error) {
      console.error("Error removing SSO provider:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    res.json({ message: `SSO provider ${id} removed` });
  }
}

export default SsoProviderController;
