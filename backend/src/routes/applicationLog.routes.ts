import { Router }from "express";
import AuthMiddleware from "../middleware/AuthMiddleware";
import ApplicationLogController from "../controllers/applicationLogController";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, ApplicationLogController.getAll);
router.get("/latest/:n", AuthMiddleware.isLoggedIn, ApplicationLogController.getLatestN);

export default router;

