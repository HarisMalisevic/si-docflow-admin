import { Router } from "express";
import ClientLogController from "./ClientLog.controller";

const router = Router();

/**
 * @openapi
 * /api/client-log:
 *   get:
 *     summary: Get all client logs
 *     tags:
 *       - ClientLog
 *     responses:
 *       200:
 *         description: List of client logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClientLog'
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    ClientLogController.getAll
);

/**
 * @openapi
 * /api/client-log/latest/{n}:
 *   get:
 *     summary: Get the latest N client logs
 *     tags:
 *       - ClientLog
 *     parameters:
 *       - in: path
 *         name: n
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of latest logs to retrieve
 *     responses:
 *       200:
 *         description: List of latest client logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClientLog'
 *       400:
 *         description: Invalid number of logs requested
 *       500:
 *         description: Internal server error
 */
router.get(
    "/latest/:n",
    ClientLogController.getLatestN
);

/**
 * @openapi
 * /api/client-log:
 *   post:
 *     summary: Create a new client log
 *     tags:
 *       - ClientLog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - machine_id
 *               - action
 *             properties:
 *               machine_id:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [instance_started, processing_req_sent, processing_result_received, command_received, instance_stopped]
 *     responses:
 *       201:
 *         description: Client log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientLog'
 *       400:
 *         description: Missing required fields or invalid action
 *       404:
 *         description: WindowsAppInstance with the given machine_id not found
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    ClientLogController.create
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     ClientLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         instance_id:
 *           type: integer
 *         action:
 *           type: string
 *           enum: [instance_started, processing_req_sent, processing_result_received, command_received, instance_stopped]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */