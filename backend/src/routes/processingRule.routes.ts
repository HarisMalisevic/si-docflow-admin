import { Router } from "express";
import ProcessingRuleController from "../controllers/processingRule.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();


router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleController.getAll
);
router.get(
    "/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleController.getById
);
router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleController.create
);
router.put(
    "/:id/update",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleController.update
);
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleController.delete
);

export default router;
