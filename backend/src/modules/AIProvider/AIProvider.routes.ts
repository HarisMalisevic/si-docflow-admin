import { Router } from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import AIProviderController from "./AIProvider.controller";

const router = Router();

/**
 * @openapi
 * /api/ai-providers:
 *   get:
 *     summary: Get all AI providers
 *     tags:
 *       - AIProvider
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of AI providers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AIProvider'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    AIProviderController.getAll
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     AIProvider:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 */