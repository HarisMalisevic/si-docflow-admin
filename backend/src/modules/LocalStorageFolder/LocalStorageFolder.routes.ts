import { Router } from "express";
import LocalStorageFoldersController from "./LocalStorageFolder.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

/**
 * @openapi
 * /api/local-storage-folder:
 *   get:
 *     summary: Get all local storage folders
 *     tags:
 *       - LocalStorageFolder
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of local storage folders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LocalStorageFolder'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    LocalStorageFoldersController.getAll
);

/**
 * @openapi
 * /api/local-storage-folder/{id}:
 *   get:
 *     summary: Get a local storage folder by ID
 *     tags:
 *       - LocalStorageFolder
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Local storage folder ID
 *     responses:
 *       200:
 *         description: Local storage folder found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocalStorageFolder'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Local storage folder not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:id",
    AuthMiddleware.isLoggedIn,
    LocalStorageFoldersController.getById
);

/**
 * @openapi
 * /api/local-storage-folder:
 *   post:
 *     summary: Create a new local storage folder
 *     tags:
 *       - LocalStorageFolder
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - path
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               path:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Local storage folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocalStorageFolder'
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
    LocalStorageFoldersController.create
);

/**
 * @openapi
 * /api/local-storage-folder/{id}:
 *   put:
 *     summary: Update a local storage folder by ID
 *     tags:
 *       - LocalStorageFolder
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Local storage folder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               path:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Local storage folder updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocalStorageFolder'
 *       400:
 *         description: Invalid ID format or invalid input
 *       401:
 *         description: Unauthorized or invalid user data
 *       404:
 *         description: Local storage folder not found
 *       500:
 *         description: Internal server error
 */
router.put(
    "/:id",
    AuthMiddleware.isLoggedIn,
    LocalStorageFoldersController.update
);

/**
 * @openapi
 * /api/local-storage-folder/{id}:
 *   delete:
 *     summary: Delete a local storage folder by ID
 *     tags:
 *       - LocalStorageFolder
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Local storage folder ID
 *     responses:
 *       200:
 *         description: Local storage folder deleted successfully
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
 *         description: Local storage folder not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    LocalStorageFoldersController.delete
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     LocalStorageFolder:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - path
 *         - is_active
 *         - created_by
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         path:
 *           type: string
 *         is_active:
 *           type: boolean
 *         created_by:
 *           type: integer
 *         updated_by:
 *           type: integer
 *           nullable: true
 */