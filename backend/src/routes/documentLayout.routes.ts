import { Router } from "express";
import DocumentLayoutController from "../controllers/documentLayout.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";
import multer from "multer";


const uploadMulter = multer({ storage: multer.memoryStorage() }); // Use memory storage for simplicity

const router = Router();


router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.getAll
);
router.get(
    "/:id",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.getById
);
router.put(
    "/:id/image",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.getImageByLayoutId
);
router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    uploadMulter.single("image"),
    DocumentLayoutController.create
);
router.put(
    "/:id",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.update
);
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.delete
);

export default router;
