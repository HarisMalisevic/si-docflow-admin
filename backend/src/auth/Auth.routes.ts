import { Router } from "express";
import AuthController from "./Auth.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

router.get(
    "/google",
    AuthController.googleLogin
);
router.get(
    "/google/callback",
    AuthController.googleCallback
);

router.get(
    "/:sso_provider_name/login",
    AuthController.ssoLogin
);
router.get(
    "/:sso_provider_name/callback",
    AuthController.ssoCallback
);
router.post(
    "/logout",
    AuthController.logout
);
router.get(
    "/profile",
    AuthMiddleware.isLoggedIn,
    AuthController.profile
);
router.post(
    "/login",
    AuthController.login
);
router.post(
    "/register",
    AuthController.register
);


export default router;