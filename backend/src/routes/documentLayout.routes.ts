import { Router } from "express";
import DocumentLayoutController from "../controllers/documentLayout.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, DocumentLayoutController.getAll);
router.get("/:id", AuthMiddleware.isLoggedIn, DocumentLayoutController.getById);
router.put("/:id/image", AuthMiddleware.isLoggedIn, DocumentLayoutController.getImageByLayoutId);
router.post("/", AuthMiddleware.isLoggedIn, DocumentLayoutController.create);
router.put("/:id", AuthMiddleware.isLoggedIn, DocumentLayoutController.update);
router.delete("/:id", AuthMiddleware.isLoggedIn, DocumentLayoutController.delete);

export default router;
