import { Router } from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import ApplicationLogsController from "./ApplicationLog.controller";

const router = Router();

/**
 * @openapi
 * /api/application-log:
 *   get:
 *     summary: Get all application logs
 *     tags:
 *       - ApplicationLog
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of application logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ApplicationLog'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    ApplicationLogsController.getAll
);

/**
 * @openapi
 * /api/application-log/latest/{n}:
 *   get:
 *     summary: Get the latest N application logs
 *     tags:
 *       - ApplicationLog
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
 *         description: List of latest application logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ApplicationLog'
 *       400:
 *         description: Invalid number of logs requested
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/latest/:n",
    AuthMiddleware.isLoggedIn,
    ApplicationLogsController.getLatestN
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     ApplicationLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         message:
 *           type: string
 *         level:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */