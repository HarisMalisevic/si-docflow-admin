import { Router } from "express";
import FTPEndpointsController from "./ExternalFTPEndpoint.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

/**
 * @openapi
 * /api/ftp-endpoints:
 *   get:
 *     summary: Get all external FTP endpoints
 *     tags:
 *       - ExternalFTPEndpoint
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of external FTP endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExternalFTPEndpoint'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    FTPEndpointsController.getAll
);

/**
 * @openapi
 * /api/ftp-endpoints/{id}:
 *   get:
 *     summary: Get an external FTP endpoint by ID
 *     tags:
 *       - ExternalFTPEndpoint
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: External FTP endpoint ID
 *     responses:
 *       200:
 *         description: External FTP endpoint found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExternalFTPEndpoint'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: External FTP endpoint not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:id",
    AuthMiddleware.isLoggedIn,
    FTPEndpointsController.getById
);

/**
 * @openapi
 * /api/ftp-endpoints:
 *   post:
 *     summary: Create a new external FTP endpoint
 *     tags:
 *       - ExternalFTPEndpoint
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExternalFTPEndpoint'
 *     responses:
 *       201:
 *         description: External FTP endpoint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExternalFTPEndpoint'
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
    FTPEndpointsController.create
);

/**
 * @openapi
 * /api/ftp-endpoints/{id}:
 *   put:
 *     summary: Update an external FTP endpoint by ID
 *     tags:
 *       - ExternalFTPEndpoint
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: External FTP endpoint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExternalFTPEndpoint'
 *     responses:
 *       200:
 *         description: External FTP endpoint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExternalFTPEndpoint'
 *       400:
 *         description: Invalid ID format or invalid input
 *       401:
 *         description: Unauthorized or invalid user data
 *       404:
 *         description: External FTP endpoint not found
 *       500:
 *         description: Internal server error
 */
router.put(
    "/:id",
    AuthMiddleware.isLoggedIn,
    FTPEndpointsController.update
);

/**
 * @openapi
 * /api/ftp-endpoints/{id}:
 *   delete:
 *     summary: Delete an external FTP endpoint by ID
 *     tags:
 *       - ExternalFTPEndpoint
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: External FTP endpoint ID
 *     responses:
 *       200:
 *         description: External FTP endpoint deleted successfully
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
 *         description: External FTP endpoint not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    FTPEndpointsController.delete
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     ExternalFTPEndpoint:
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
 *         host:
 *           type: string
 *         port:
 *           type: integer
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         secure:
 *           type: boolean
 *         path:
 *           type: string
 *         created_by:
 *           type: integer
 *         updated_by:
 *           type: integer
 *           nullable: true
 */