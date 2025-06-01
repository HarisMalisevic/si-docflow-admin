import { Router } from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import UniversalDeviceInterfaceLogController from "./UniversalDeviceInterfaceLog.controller";

const router = Router();

/**
 * @openapi
 * /api/universal-device-logs:
 *   get:
 *     summary: Get all universal device interface logs
 *     tags:
 *       - UniversalDeviceInterfaceLog
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of universal device interface logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UniversalDeviceInterfaceLog'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    UniversalDeviceInterfaceLogController.getAll
);

/**
 * @openapi
 * /api/universal-device-logs:
 *   post:
 *     summary: Create a new universal device interface log
 *     tags:
 *       - UniversalDeviceInterfaceLog
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - source
 *               - event_id
 *               - task_category
 *               - message
 *               - app_instance_id
 *             properties:
 *               level:
 *                 type: string
 *               source:
 *                 type: string
 *               event_id:
 *                 type: string
 *               task_category:
 *                 type: string
 *               message:
 *                 type: string
 *               app_instance_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Universal device interface log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UniversalDeviceInterfaceLog'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    UniversalDeviceInterfaceLogController.create
);

/**
 * @openapi
 * /api/universal-device-logs/latest/{n}:
 *   get:
 *     summary: Get the latest N universal device interface logs
 *     tags:
 *       - UniversalDeviceInterfaceLog
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
 *         description: List of latest universal device interface logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UniversalDeviceInterfaceLog'
 *       400:
 *         description: Invalid number of latest universal device logs
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/latest/:n",
    AuthMiddleware.isLoggedIn,
    UniversalDeviceInterfaceLogController.getLatestN
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     UniversalDeviceInterfaceLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         level:
 *           type: string
 *         source:
 *           type: string
 *         event_id:
 *           type: string
 *         task_category:
 *           type: string
 *         message:
 *           type: string
 *         app_instance_id:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */