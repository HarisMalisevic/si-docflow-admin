import db from "../database/db";
import { Request, Response } from "express";
import SSOProvider from "../database/SSOProvider";

class SsoProviderController {
  static async getAll(req: Request, res: Response) {
    try {
      const allSSOProviders: SSOProvider[] = await db.sso_providers.findAll();

      if (!allSSOProviders) {
        throw new Error("No SSO providers found in the database!");
      }
      res.json(allSSOProviders);
    } catch (error) {
      console.error("Error fetching SSO providers: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async add(req: Request, res: Response) {
    const jsonReq: {
      display_name: string;
      api_name: string;
      client_id: string;
      client_secret: string;
      callback_url: string;
      authorization_url: string;
      token_url: string;
    } = req.body || {};

    console.log("jsonReq", jsonReq);

    if (!jsonReq.display_name) {
      res.status(400).json({ message: "Display name is required" });
      return;
    } else if (!jsonReq.api_name) {
      res.status(400).json({ message: "API name is required" });
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
    } else if (!jsonReq.authorization_url) {
      res.status(400).json({ message: "Authorization_url is required" });
      return;
    } else if (!jsonReq.token_url) {
      res.status(400).json({ message: "Token_url is required" });
      return;
    }

    try {
      await db.sso_providers.create({
        display_name: jsonReq.display_name,
        api_name: jsonReq.api_name,
        client_id: jsonReq.client_id,
        client_secret: jsonReq.client_secret,
        callback_url: jsonReq.callback_url,
        authorization_url: jsonReq.authorization_url,
        token_url: jsonReq.token_url
      });
      res.status(200).json({ message: "SSO provider added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add SSO provider", error });
    }
  }

  static async delete(req: Request, res: Response) {
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

  static async preview(req: Request, res: Response) {
    try {
      const allSSOProviders: SSOProvider[] = await db.sso_providers.findAll();

      if (!allSSOProviders) {
        throw new Error("No SSO providers found in the database!");
      }

      const previewData = allSSOProviders.map(provider => ({
        display_name: provider.display_name,
        authorization_url: provider.authorization_url,
      }));

      res.json(previewData);

    } catch (error) {
      console.error("Error fetching SSO providers: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default SsoProviderController;
