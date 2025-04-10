/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import SsoProviderController from "../controllers/ssoProviders.controller";

const router = Router();

router.get("/sso-provider", SsoProviderController.getAllSSOProviders);
router.post("/sso-provider", SsoProviderController.addSSOProvider);
router.delete("/sso-provider/:id", SsoProviderController.deleteSSOProvider);

export default router;
