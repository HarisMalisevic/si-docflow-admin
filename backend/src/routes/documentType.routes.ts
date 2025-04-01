import { Router } from "express";
import DocumentTypeController from "@controllers/documentType.controller";

const router = Router();

router.get("/", DocumentTypeController.getAll);
router.post("/", DocumentTypeController.create);
router.delete("/:id", DocumentTypeController.remove);

export default router;
