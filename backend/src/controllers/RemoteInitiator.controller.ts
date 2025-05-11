import { Request, Response } from "express";
import db from "../database/db";
import { v4 as uuidv4 } from "uuid"; // Import UUID library

class RemoteInitiatorController {
  private static async generateKey(): Promise<string> {
    // Static method to generate a new unique initiator key

    // Generate a UUID
    const key = uuidv4().toString();

    console.log("Generated initiator key: ", key);

    return key;
  }

  public static async validateKey(initiator_key: string): Promise<boolean> {
    if (!initiator_key) {
      throw new Error("Missing initiator key");
    }

    try {
      // Check if the key exists in the database
      const exists = await db.remote_initiators.findOne({
        where: { initiator_key },
      });

      return !!exists; // Return true if the key exists, otherwise false
    } catch (error) {
      console.error("Error validating initiator key:", error);
      throw new Error("Internal server error");
    }
  }

  static async getRemoteInitiatorKey(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const initiatorKey = await RemoteInitiatorController.generateKey();

      console.log("Generated initiator key: ", initiatorKey);

      // Save the initiator key to the database
      await db.remote_initiators.create({ initiator_key: initiatorKey });

      res.status(200).send({ initiator_key: initiatorKey });
    } catch (error) {
      console.error("Error generating initiator key:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  }

  static async validateRemoteInitiatorKey(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // TODO: Kljuc je potrebno da bude u headeru, u body je PRIVREMENO! - Haris
      const { initiator_key } = req.body;

      const isValid = await RemoteInitiatorController.validateKey(
        initiator_key
      );

      if (isValid) {
        res.status(200).send({ valid: true });
      } else {
        res.status(403).send({ valid: false });
      }
    } catch (error) {
      console.error("Error validating initiator key:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const initiators = await db.remote_initiators.findAll();
      res.status(200).json(initiators);
    } catch (error) {
      console.error("Error fetching remote initiators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default RemoteInitiatorController;