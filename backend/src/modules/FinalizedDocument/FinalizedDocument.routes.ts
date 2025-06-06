import { Router } from "express";
import FinalizedDocumentController from "./FinalizedDocument.controller";

const router = Router();

/**
 * @openapi
 * /api/finalized-documents:
 *   post:
 *     summary: Create a new finalized document
 *     tags:
 *       - FinalizedDocument
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Finalized document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 finalizedDocument:
 *                   $ref: '#/components/schemas/FinalizedDocument'
 *       400:
 *         description: Content is required
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    FinalizedDocumentController.create
);

/**
 * @openapi
 * /api/finalized-documents:
 *   get:
 *     summary: Get all finalized documents (newest first)
 *     tags:
 *       - FinalizedDocument
 *     responses:
 *       200:
 *         description: List of finalized documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FinalizedDocument'
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    FinalizedDocumentController.getAll
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     FinalizedDocument:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         content:
 *           type: string
 */