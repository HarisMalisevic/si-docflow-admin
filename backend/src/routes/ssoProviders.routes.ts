/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import SsoProviderController from "../controllers/ssoProviders.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get(
  "/",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.getAll
);
router.post(
  "/",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.add
);
router.delete(
  "/:id",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.delete
);

router.get(
  "/preview",
  SsoProviderController.preview
);

export default router;
