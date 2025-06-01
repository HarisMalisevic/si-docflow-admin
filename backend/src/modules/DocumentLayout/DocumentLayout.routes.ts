import { Router } from "express";
import DocumentLayoutController from "./DocumentLayout.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import multer from "multer";

const uploadMulter = multer({ storage: multer.memoryStorage() }); // Use memory storage for simplicity

const router = Router();

/**
 * @openapi
 * /api/document-layouts:
 *   get:
 *     summary: Get all document layouts
 *     tags:
 *       - DocumentLayout
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of document layouts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DocumentLayout'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.getAll
);

/**
 * @openapi
 * /api/document-layouts/{id}:
 *   get:
 *     summary: Get a document layout by ID
 *     tags:
 *       - DocumentLayout
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document layout ID
 *     responses:
 *       200:
 *         description: Document layout found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentLayout'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document layout not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:id",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.getById
);

/**
 * @openapi
 * /api/document-layouts/{id}/image:
 *   get:
 *     summary: Get the image for a document layout by layout ID
 *     tags:
 *       - DocumentLayout
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document layout ID
 *     responses:
 *       200:
 *         description: Image file
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:id/image",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.getImageByLayoutId
);

/**
 * @openapi
 * /api/document-layouts:
 *   post:
 *     summary: Create a new document layout
 *     tags:
 *       - DocumentLayout
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: string
 *                 description: JSON string with layout metadata (name, fields, document_type, image_width, image_height)
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document layout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 layout_id:
 *                   type: integer
 *                 image_id:
 *                   type: integer
 *       400:
 *         description: Missing image or metadata, or missing required metadata fields, or document type already has a layout
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document type not found or could not be updated
 *       500:
 *         description: Server error while saving layout
 */
router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    uploadMulter.single("image"),
    DocumentLayoutController.create
);

/**
 * @openapi
 * /api/document-layouts/{id}/update:
 *   put:
 *     summary: Update a document layout by ID
 *     tags:
 *       - DocumentLayout
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document layout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fields:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document layout updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID format or invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document layout not found or could not be updated
 *       500:
 *         description: Internal server error
 */
router.put(
    "/:id/update",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.update
);

/**
 * @openapi
 * /api/document-layouts/{id}:
 *   delete:
 *     summary: Delete a document layout by ID
 *     tags:
 *       - DocumentLayout
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document layout ID
 *     responses:
 *       200:
 *         description: Document layout deleted successfully
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
 *         description: Document layout not found or could not be deleted
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    DocumentLayoutController.delete
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     DocumentLayout:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         fields:
 *           type: string
 *         image_id:
 *           type: integer
 *         created_by:
 *           type: integer
 *         updated_by:
 *           type: integer
 */
