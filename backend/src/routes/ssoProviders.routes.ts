/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import SsoProviderController from "../controllers/ssoProviders.controller";

const router = Router();

router.get("/oauth-provider", SsoProviderController.getAllOAuthProviders);
router.post("/oauth-provider", SsoProviderController.addOAuthProvider);
router.delete("/oauth-provider/:id", SsoProviderController.deleteOAuthProvider);

export default router;
