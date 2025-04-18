import { Router } from "express";
import AccessRightsController from "../controllers/accessRights.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get(
  "/",
  AuthMiddleware.isLoggedIn,
  AccessRightsController.getAll
);
router.get(
  "/:id",
  AuthMiddleware.isLoggedIn,
  AccessRightsController.getById
);
router.post(
  "/",
  AuthMiddleware.isLoggedIn,
  AccessRightsController.create
);
router.put(
  "/:id",
  AuthMiddleware.isLoggedIn,
  AccessRightsController.update
);
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    AccessRightsController.delete

)

export default router;
