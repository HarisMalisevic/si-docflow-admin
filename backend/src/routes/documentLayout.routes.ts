import { Router } from "express";
import DocumentLayoutController from "../controllers/documentLayout.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.getAll
);
router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.create
);
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.delete
);

export default router;
