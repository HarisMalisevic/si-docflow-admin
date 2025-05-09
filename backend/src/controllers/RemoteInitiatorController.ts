import { Request, Response } from "express";
import db from "../database/db";
import RemoteInitiator from "database/RemoteInitiator";
import { randomBytes } from "crypto";

class RemoteInitiatorController {

    private static readonly KEY_SIZE_BYTES = 16;

    private static async generateKey(): Promise<string> {
        // Static method to generate a new unique initiator key
        let key: string;
        let exists: RemoteInitiator | null;

        do {
            // Generate a random string
            key = randomBytes(RemoteInitiatorController.KEY_SIZE_BYTES).toString();

            exists = await db.remote_initiators.findOne({
                where: { initiator_key: key }
            });

        } while (exists); // Repeat until a unique key is found

        return key;
    }

    private static async validateKey(initiator_key: string): Promise<boolean> {

        if (!initiator_key) {
            throw new Error("Missing initiator key");
        }

        try {
            const exists = await db.remote_initiators.findOne({
                where: { initiator_key }
            });

            if (exists) {
                return true; // Key is valid
            } else {
                return false; // Key is invalid
            }
        } catch (error) {
            console.error("Error validating initiator key:", error);
            throw new Error("Internal server error");
        }
    }

    static async getRemoteInitiatorKey(req: Request, res: Response): Promise<void> {
        try {
            const initiatorKey = await RemoteInitiatorController.generateKey();

            console.log("Generated initiator key: ", initiatorKey);

            // Save the initiator key to the database
            await db.remote_initiators.create({ initiator_key: initiatorKey });

            res.status(200).send({ initiator_key: initiatorKey });
        } catch (error) {
            console.error("Error generating initiator key:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    static async validateRemoteInitiatorKey(req: Request, res: Response): Promise<void> {
        try {

            // TODO: Kljuc je potrebno da bude u headeru, u body je PRIVREMENO! - Haris
            const { initiator_key } = req.body;

            const isValid = await RemoteInitiatorController.validateKey(initiator_key);

            if (isValid) {
                res.status(200).send({ valid: true });
            } else {
                res.status(403).send({ valid: false });
            }
        } catch (error) {
            console.error("Error validating initiator key:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

}

export default RemoteInitiatorController;