/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import DocumentTypeController from "../controllers/documentType.controller";
import AuthMiddleware from "../middleware/authMiddleware";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn as any, DocumentTypeController.getAll);
router.post("/", AuthMiddleware.isLoggedIn as any, DocumentTypeController.create);
router.delete("/:id", AuthMiddleware.isLoggedIn as any, DocumentTypeController.remove);

export default router;
