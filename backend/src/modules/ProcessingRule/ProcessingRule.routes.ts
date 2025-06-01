import { Router } from "express";
import ProcessingRuleController from "./ProcessingRule.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

/**
 * @openapi
 * /api/processing-rules:
 *   get:
 *     summary: Get all processing rules
 *     tags:
 *       - ProcessingRule
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of processing rules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessingRule'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleController.getAll
);

/**
 * @openapi
 * /api/processing-rules/{id}:
 *   get:
 *     summary: Get a processing rule by ID
 *     tags:
 *       - ProcessingRule
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Processing rule ID
 *     responses:
 *       200:
 *         description: Processing rule found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessingRule'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Processing rule not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleController.getById
);

/**
 * @openapi
 * /api/processing-rules:
 *   post:
 *     summary: Create a new processing rule
 *     tags:
 *       - ProcessingRule
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
 *               - document_type_id
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               document_type_id:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Processing rule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessingRule'
 *       400:
 *         description: Title and document_type_id are required or failed to create processing rule
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleController.create
);

/**
 * @openapi
 * /api/processing-rules/{id}/update:
 *   put:
 *     summary: Update a processing rule by ID
 *     tags:
 *       - ProcessingRule
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Processing rule ID
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
 *                 nullable: true
 *               document_type_id:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Processing rule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Failed to update processing rule
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Processing rule not found
 *       500:
 *         description: Internal server error
 */
router.put(
    "/:id/update",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleController.update
);

/**
 * @openapi
 * /api/processing-rules/{id}:
 *   delete:
 *     summary: Delete a processing rule by ID
 *     tags:
 *       - ProcessingRule
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Processing rule ID
 *     responses:
 *       200:
 *         description: Processing rule deleted successfully
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
 *         description: Processing rule not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleController.delete
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     ProcessingRule:
 *       type: object
 *       required:
 *         - title
 *         - document_type_id
 *         - is_active
 *         - created_by
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         document_type_id:
 *           type: integer
 *         is_active:
 *           type: boolean
 *         created_by:
 *           type: integer
 *         updated_by:
 *           type: integer
 *           nullable: true
 */
