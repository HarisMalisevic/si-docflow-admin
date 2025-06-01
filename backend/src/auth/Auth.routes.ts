import { Router } from "express";
import AuthController from "./Auth.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();

/**
 * @openapi
 * /auth/google:
 *   get:
 *     summary: Start Google OAuth login
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects to Google login
 */
router.get(
    "/google",
    AuthController.googleLogin
);

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects after Google login
 *       401:
 *         description: Authentication failed
 */
router.get(
    "/google/callback",
    AuthController.googleCallback
);

/**
 * @openapi
 * /auth/{sso_provider_name}/login:
 *   get:
 *     summary: Start SSO login with provider
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: sso_provider_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the SSO provider
 *     responses:
 *       302:
 *         description: Redirects to SSO provider login
 *       404:
 *         description: SSO provider not found
 */
router.get(
    "/:sso_provider_name/login",
    AuthController.ssoLogin
);

/**
 * @openapi
 * /auth/{sso_provider_name}/callback:
 *   get:
 *     summary: SSO provider callback
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: sso_provider_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the SSO provider
 *     responses:
 *       302:
 *         description: Redirects after SSO login
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: SSO provider not found
 */
router.get(
    "/:sso_provider_name/callback",
    AuthController.ssoCallback
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects after logout
 *       500:
 *         description: Failed to log out
 */
router.post(
    "/logout",
    AuthController.logout
);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     summary: Get the current user's profile
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.get(
    "/profile",
    AuthMiddleware.isLoggedIn,
    AuthController.profile
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post(
    "/login",
    AuthController.login
);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully registered
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post(
    "/register",
    AuthController.register
);


export default router;