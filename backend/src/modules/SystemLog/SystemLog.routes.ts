import { Router } from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import SystemLogsController from "./SystemLog.controller"

const router = Router();

/**
 * @openapi
 * /api/system-log:
 *   get:
 *     summary: Get all system logs
 *     tags:
 *       - SystemLog
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of system logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SystemLog'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", AuthMiddleware.isLoggedIn, SystemLogsController.getAll);

/**
 * @openapi
 * /api/system-log/latest/{n}:
 *   get:
 *     summary: Get the latest N system logs
 *     tags:
 *       - SystemLog
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
 *         description: List of latest system logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SystemLog'
 *       400:
 *         description: Invalid number of logs requested
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/latest/:n", AuthMiddleware.isLoggedIn, SystemLogsController.getLatestN);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     SystemLog:
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