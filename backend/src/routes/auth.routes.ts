import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.get("/google", AuthController.googleLogin);
router.get("/google/callback", AuthController.googleCallback);
router.delete("/logout", AuthController.logout);

export default router;