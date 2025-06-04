import { Router } from "express";
import SsoProviderController from "./SSOProvider.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

/**
 * @openapi
 * /api/sso-providers:
 *   get:
 *     summary: Get all SSO providers
 *     tags:
 *       - SSOProvider
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of SSO providers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SSOProvider'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.getAll
);

/**
 * @openapi
 * /api/sso-providers:
 *   post:
 *     summary: Add a new SSO provider
 *     tags:
 *       - SSOProvider
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - display_name
 *               - api_name
 *               - client_id
 *               - client_secret
 *               - callback_url
 *               - authorization_url
 *               - token_url
 *             properties:
 *               display_name:
 *                 type: string
 *               api_name:
 *                 type: string
 *               client_id:
 *                 type: string
 *               client_secret:
 *                 type: string
 *               callback_url:
 *                 type: string
 *               authorization_url:
 *                 type: string
 *               token_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: SSO provider added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to add SSO provider
 */
router.post(
  "/",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.add
);

/**
 * @openapi
 * /api/sso-providers/{id}:
 *   delete:
 *     summary: Delete an SSO provider by ID
 *     tags:
 *       - SSOProvider
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: SSO provider ID
 *     responses:
 *       200:
 *         description: SSO provider removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: SSO provider not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  SsoProviderController.delete
);

/**
 * @openapi
 * /api/sso-providers/preview:
 *   get:
 *     summary: Get preview of all SSO providers (public)
 *     tags:
 *       - SSOProvider
 *     responses:
 *       200:
 *         description: Preview of SSO providers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   display_name:
 *                     type: string
 *                   authorization_url:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get(
  "/preview",
  SsoProviderController.preview
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     SSOProvider:
 *       type: object
 *       required:
 *         - display_name
 *         - api_name
 *         - client_id
 *         - client_secret
 *         - callback_url
 *         - authorization_url
 *         - token_url
 *       properties:
 *         id:
 *           type: integer
 *         display_name:
 *           type: string
 *         api_name:
 *           type: string
 *         client_id:
 *           type: string
 *         client_secret:
 *           type: string
 *         callback_url:
 *           type: string
 *         authorization_url:
 *           type: string
 *         token_url:
 *           type: string
 */
