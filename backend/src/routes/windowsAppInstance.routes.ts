import { Router} from "express";
import WindowsAppInstanceController from "../controllers/windowsAppInstance.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.getAll);
router.get("/:id", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.getById);
router.post("/", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.create);
router.put("/:id", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.update);
router.delete("/:id", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.delete);

export default router;