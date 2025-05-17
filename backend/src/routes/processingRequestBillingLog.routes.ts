import { Router } from "express";
import AuthMiddleware from "../middleware/AuthMiddleware";
import ProcessingRequestsBillingLogController from "../controllers/processingRequestsBillingLog.controller";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, ProcessingRequestsBillingLogController.getAll);
router.get("/latest/:id", AuthMiddleware.isLoggedIn, ProcessingRequestsBillingLogController.getLatestN);

export default router;