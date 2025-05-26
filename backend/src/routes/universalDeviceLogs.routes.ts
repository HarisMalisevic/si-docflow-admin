import { Router } from "express";
import AuthMiddleware from "../middleware/AuthMiddleware";
import UniversalDeviceInterfaceLogController from "../controllers/universalDeviceInterfaceLog.controller";

const router = Router();

router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    UniversalDeviceInterfaceLogController.getAll
);

router.get(
    "/latest/:n",
    AuthMiddleware.isLoggedIn,
    UniversalDeviceInterfaceLogController.getLatestN
);

export default router;