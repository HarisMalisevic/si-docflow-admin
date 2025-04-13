/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import SsoProviderController from "../controllers/ssoProviders.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get(
  "/",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.getAllSSOProviders
);
router.post(
  "/",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.addSSOProvider
);
router.delete(
  "/:id",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.deleteSSOProvider
);

export default router;
