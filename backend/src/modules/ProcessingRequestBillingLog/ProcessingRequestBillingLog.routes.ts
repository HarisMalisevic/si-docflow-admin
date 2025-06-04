import { Router } from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import ProcessingRequestsBillingLogController from "./ProcessingRequestBillingLog.controller";

const router = Router();

/**
 * @openapi
 * /api/processing-requests-billing-logs:
 *   get:
 *     summary: Get all processing requests billing logs
 *     tags:
 *       - ProcessingRequestBillingLog
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of processing requests billing logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessingRequestBillingLog'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    ProcessingRequestsBillingLogController.getAll
);

/**
 * @openapi
 * /api/processing-requests-billing-logs/latest/{n}:
 *   get:
 *     summary: Get the latest N processing requests billing logs
 *     tags:
 *       - ProcessingRequestBillingLog
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: n
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of latest logs to retrieve
 *     responses:
 *       200:
 *         description: List of latest processing requests billing logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessingRequestBillingLog'
 *       400:
 *         description: Invalid number of latest processing requests billing logs
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/latest/:n",
    AuthMiddleware.isLoggedIn,
    ProcessingRequestsBillingLogController.getLatestN
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     ProcessingRequestBillingLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         document_type_id:
 *           type: integer
 *         file_name:
 *           type: string
 *         ai_provider_id:
 *           type: integer
 *         price:
 *           type: number
 *           format: double
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */