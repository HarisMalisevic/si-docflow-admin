import { Router } from "express";
import AuthMiddleware from "../middleware/AuthMiddleware";
import AIProviderController from "../controllers/aiProviders.controller";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, AIProviderController.getAll);

export default router;