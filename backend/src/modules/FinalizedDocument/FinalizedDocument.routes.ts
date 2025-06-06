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