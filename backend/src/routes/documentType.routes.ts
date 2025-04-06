/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import DocumentTypeController from "../controllers/documentType.controller";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware as any, DocumentTypeController.getAll);
router.post("/", authMiddleware as any, DocumentTypeController.create);
router.delete("/:id", authMiddleware as any, DocumentTypeController.remove);

export default router;
