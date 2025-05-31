import { Router } from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import UniversalDeviceInterfaceLogController from "./UniversalDeviceInterfaceLog.controller";

const router = Router();

router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    UniversalDeviceInterfaceLogController.getAll
);

router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    UniversalDeviceInterfaceLogController.create
);

router.get(
    "/latest/:n",
    AuthMiddleware.isLoggedIn,
    UniversalDeviceInterfaceLogController.getLatestN
);

export default router;