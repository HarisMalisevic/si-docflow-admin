import { Router } from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import ApplicationLogsController from "./ApplicationLog.controller";

const router = Router();

router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    ApplicationLogsController.getAll
);

router.get(
    "/latest/:n",
    AuthMiddleware.isLoggedIn,
    ApplicationLogsController.getLatestN
);

export default router;

