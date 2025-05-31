import { Router } from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import ProcessingRequestsBillingLogController from "./ProcessingRequestBillingLog.controller";

const router = Router();

router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    ProcessingRequestsBillingLogController.getAll
);

router.get(
    "/latest/:n",
    AuthMiddleware.isLoggedIn,
    ProcessingRequestsBillingLogController.getLatestN
);

export default router;