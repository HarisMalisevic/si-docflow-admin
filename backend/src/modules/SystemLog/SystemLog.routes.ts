import { Router } from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import SystemLogsController from "./SystemLog.controller"

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, SystemLogsController.getAll);
router.get("/latest/:n", AuthMiddleware.isLoggedIn, SystemLogsController.getLatestN);

export default router;