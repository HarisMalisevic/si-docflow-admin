/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import DocumentTypeController from "../controllers/documentType.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    DocumentTypeController.getAll
);
router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    DocumentTypeController.create
);
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    DocumentTypeController.remove
);

export default router;
