import { Router } from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import AIProviderController from "./AIProvider.controller";

const router = Router();

router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    AIProviderController.getAll
);

export default router;