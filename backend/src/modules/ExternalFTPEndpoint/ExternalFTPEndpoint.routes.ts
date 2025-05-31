import { Router } from "express";
import FTPEndpointsController from "./ExternalFTPEndpoint.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

router.get("/",
    AuthMiddleware.isLoggedIn,
    FTPEndpointsController.getAll
);

router.get("/:id",
    AuthMiddleware.isLoggedIn,
    FTPEndpointsController.getById
);

router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    FTPEndpointsController.create);

router.put(
    "/:id",
    AuthMiddleware.isLoggedIn,
    FTPEndpointsController.update);

router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    FTPEndpointsController.delete);


export default router;