import { Router } from "express";
import RemoteProcessingController from "./RemoteProcessing.controller"

const router = Router();

/**
 * @openapi
 * /api/remote/process:
 *   post:
 *     summary: Receive and forward a remote processing command
 *     tags:
 *       - RemoteProcessing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - target_instance_id
 *               - document_type_id
 *               - file_name
 *             properties:
 *               target_instance_id:
 *                 type: integer
 *               document_type_id:
 *                 type: integer
 *               file_name:
 *                 type: string
 *     parameters:
 *       - in: header
 *         name: initiator-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Initiator key for authentication
 *       - in: header
 *         name: socket-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Websocket connection ID for the initiator
 *     responses:
 *       200:
 *         description: Processing command successfully forwarded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing or invalid initiator key, socket ID, or required fields
 *       403:
 *         description: Invalid initiator key
 *       404:
 *         description: Target instance not found
 *       500:
 *         description: Internal server error
 */
router.post("/process", RemoteProcessingController.receiveAndForwardProcessingCommand);

/**
 * @openapi
 * /api/remote/result:
 *   post:
 *     summary: Receive and forward a remote processing result
 *     tags:
 *       - RemoteProcessing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - document_type_id
 *               - file_name
 *               - ocr_result
 *             properties:
 *               document_type_id:
 *                 type: integer
 *               file_name:
 *                 type: string
 *               ocr_result:
 *                 type: object
 *     parameters:
 *       - in: header
 *         name: transaction-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID for the processing result
 *     responses:
 *       200:
 *         description: Processing result received and forwarded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing or invalid transaction ID or required fields
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.post("/result", RemoteProcessingController.receiveAndForwardProcessingResult);

export default router;