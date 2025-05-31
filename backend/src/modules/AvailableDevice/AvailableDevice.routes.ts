import { Router } from "express";
import AvailableDeviceController from "./AvailableDevice.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, AvailableDeviceController.getAll);

router.get(
  "/:id",
  AuthMiddleware.isLoggedIn,
  AvailableDeviceController.getById
);

router.get(
  "/app-instance/:id",
  AuthMiddleware.isLoggedIn,
  AvailableDeviceController.getByAppInstanceId
);

export default router;
