import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.get("/:sso_provider_name/login", AuthController.ssoLogin);
router.get("/:sso_provider_name/callback", AuthController.ssoCallback);
router.post("/logout", AuthController.logout);

export default router;