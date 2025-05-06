import { Router } from "express";
import APIEndpointsController from "../controllers/apiEndpointsController";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, APIEndpointsController.getAll);
router.get("/:id", AuthMiddleware.isLoggedIn, APIEndpointsController.getById);
router.post("/", AuthMiddleware.isLoggedIn, APIEndpointsController.create);
router.put("/:id", AuthMiddleware.isLoggedIn, APIEndpointsController.update);
router.delete("/:id", AuthMiddleware.isLoggedIn, APIEndpointsController.delete);

export default router;

