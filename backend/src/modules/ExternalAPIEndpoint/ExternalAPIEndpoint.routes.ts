import { Router } from "express";
import APIEndpointsController from "./ExternalAPIEndpoint.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

/**
 * @openapi
 * /api/api-endpoints:
 *   get:
 *     summary: Get all external API endpoints
 *     tags:
 *       - ExternalAPIEndpoint
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of external API endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExternalAPIEndpoint'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    APIEndpointsController.getAll
);

/**
 * @openapi
 * /api/api-endpoints/{id}:
 *   get:
 *     summary: Get an external API endpoint by ID
 *     tags:
 *       - ExternalAPIEndpoint
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: External API endpoint ID
 *     responses:
 *       200:
 *         description: External API endpoint found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExternalAPIEndpoint'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: External API endpoint not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:id",
    AuthMiddleware.isLoggedIn,
    APIEndpointsController.getById
);

/**
 * @openapi
 * /api/api-endpoints:
 *   post:
 *     summary: Create a new external API endpoint
 *     tags:
 *       - ExternalAPIEndpoint
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExternalAPIEndpoint'
 *     responses:
 *       200:
 *         description: External API endpoint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExternalAPIEndpoint'
 *       400:
 *         description: Missing or invalid required fields
 *       401:
 *         description: Unauthorized or invalid user data
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    APIEndpointsController.create
);

/**
 * @openapi
 * /api/api-endpoints/{id}:
 *   put:
 *     summary: Update an external API endpoint by ID
 *     tags:
 *       - ExternalAPIEndpoint
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: External API endpoint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExternalAPIEndpoint'
 *     responses:
 *       200:
 *         description: External API endpoint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExternalAPIEndpoint'
 *       400:
 *         description: Invalid ID format or invalid input
 *       401:
 *         description: Unauthorized or invalid user data
 *       404:
 *         description: External API endpoint not found
 *       500:
 *         description: Internal server error
 */
router.put(
    "/:id",
    AuthMiddleware.isLoggedIn,
    APIEndpointsController.update
);

/**
 * @openapi
 * /api/api-endpoints/{id}:
 *   delete:
 *     summary: Delete an external API endpoint by ID
 *     tags:
 *       - ExternalAPIEndpoint
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: External API endpoint ID
 *     responses:
 *       200:
 *         description: External API endpoint deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: External API endpoint not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    APIEndpointsController.delete
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     ExternalAPIEndpoint:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *           nullable: true
 *         description:
 *           type: string
 *           nullable: true
 *         is_active:
 *           type: boolean
 *         auth_type:
 *           type: string
 *           enum: [Basic, Bearer, API_Key, OAuth, None]
 *           nullable: true
 *         auth_credentials:
 *           type: string
 *           nullable: true
 *         method:
 *           type: string
 *         base_url:
 *           type: string
 *         route:
 *           type: string
 *         query_parameters:
 *           type: string
 *           nullable: true
 *         headers:
 *           type: string
 *         body:
 *           type: string
 *           nullable: true
 *         timeout_seconds:
 *           type: integer
 *         send_file:
 *           type: boolean
 *         created_by:
 *           type: integer
 *         updated_by:
 *           type: integer
 *           nullable: true
 */

