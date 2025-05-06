import { Router } from "express";
import LocalStorageFoldersController from "../controllers/localStorageFolder.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, LocalStorageFoldersController.getAll);
router.get("/:id", AuthMiddleware.isLoggedIn, LocalStorageFoldersController.getById);
router.post("/", AuthMiddleware.isLoggedIn, LocalStorageFoldersController.create);
router.put("/:id", AuthMiddleware.isLoggedIn, LocalStorageFoldersController.update);
router.delete("/:id", AuthMiddleware.isLoggedIn, LocalStorageFoldersController.delete);

export default router;