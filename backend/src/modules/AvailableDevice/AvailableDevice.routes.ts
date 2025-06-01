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
  "/app-instance/:instance_id",
  AuthMiddleware.isLoggedIn,
  AvailableDeviceController.getByAppInstanceId
);

router.get(
  "/app-instance/chosen-device/:instance_id",
  AuthMiddleware.isLoggedIn,
  AvailableDeviceController.getChosenDeviceForInstance
)

router.put(
  "/app-instance/chosen-device/:instance_id",
  AuthMiddleware.isLoggedIn,
  AvailableDeviceController.setChosenDeviceForInstance
)

export default router;
