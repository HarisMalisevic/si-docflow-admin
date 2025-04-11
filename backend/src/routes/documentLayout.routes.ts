import { Router } from "express";
import DocumentLayoutController from "../controllers/documentLayout.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, DocumentLayoutController.getAllDocumentLayouts);
router.post("/", AuthMiddleware.isLoggedIn, DocumentLayoutController.createDocumentLayout);
router.delete("/:id", AuthMiddleware.isLoggedIn, DocumentLayoutController.deleteDocumentLayout);

export default router;
