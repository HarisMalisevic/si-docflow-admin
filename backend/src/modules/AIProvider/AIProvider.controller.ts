import { Request, Response } from "express";
import DB from "../../database";
import AIProvider from "./AIProvider.model";

class AIProviderController {
    static async getAll(req: Request, res: Response) {
        try {
            const providers: AIProvider[] = await DB.ai_providers.findAll();
            res.status(200).json(providers);
        } catch (error){
            console.error("Error fetching AI providers: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default AIProviderController;