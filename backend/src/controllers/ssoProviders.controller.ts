import { where } from "sequelize";
import db from "../database/db";
import { Request, Response } from "express";

class SsoProviderController {
  static async getAllOAuthProviders(req: Request, res: Response) {
    try {
      const allOAuthProviders: {
        name: string;
        client_id: string;
        client_secret: string;
        callback_url: string;
      }[] = await db.oauth_providers.findAll();
      if (!allOAuthProviders) {
        throw new Error("No OAuth providers found in the database!");
      }
      res.json(allOAuthProviders);
    } catch (error) {
      console.error("Error fetching oauth providers: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async addOAuthProvider(req: Request, res: Response) {
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
      await db.oauth_providers.create({
        name: jsonReq.name,
        client_id: jsonReq.client_id,
        client_secret: jsonReq.client_secret,
        callback_url: jsonReq.callback_url,
      });
      res.status(200).json({ message: "OAuth provider added successfully" });
    } catch (error) {
        res.status(400).json({ message: "Failed to add OAuth provider", error });
    }
  }

  static async deleteOAuthProvider(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const oauth_provider = await db.oauth_providers.findOne({where: { id }});

        if(!oauth_provider) {
            res.status(404).json({message: `OAuth provider with ID ${id} not found`});
            return;
        }

        await db.oauth_providers.destroy({where: {id }});
    } catch (error) {
        console.error("Error removing OAuth provider:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }

    res.json({ message: `OAuth provider ${id} removed` });
  }
}

export default SsoProviderController;
