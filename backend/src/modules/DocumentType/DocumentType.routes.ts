/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import DocumentTypeController from "./DocumentType.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

/**
 * @openapi
 * /api/document-types:
 *   get:
 *     summary: Get all document types
 *     tags:
 *       - DocumentType
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of document types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DocumentType'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    DocumentTypeController.getAll
);

/**
 * @openapi
 * /api/document-types:
 *   post:
 *     summary: Create a new document type
 *     tags:
 *       - DocumentType
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document type added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Name is required or failed to add document type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    DocumentTypeController.create
);

/**
 * @openapi
 * /api/document-types/{id}:
 *   delete:
 *     summary: Delete a document type by ID
 *     tags:
 *       - DocumentType
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document type ID
 *     responses:
 *       200:
 *         description: Document type removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document type not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    DocumentTypeController.remove
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     DocumentType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         document_layout_id:
 *           type: integer
 *         created_by:
 *           type: integer
 */
