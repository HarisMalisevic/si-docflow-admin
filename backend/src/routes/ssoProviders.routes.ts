/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import SsoProviderController from "../controllers/ssoProviders.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get(
  "/sso-provider",
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.getAllSSOProviders
);
router.post(
  "/sso-provider",
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.addSSOProvider
);
router.delete(
  "/sso-provider/:id",
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.deleteSSOProvider
);

export default router;
