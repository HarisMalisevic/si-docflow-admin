import { Router } from "express";
import RemoteTransactionsController from "./RemoteTransaction.controller";

const router = Router();

/**
 * @openapi
 * /api/remote-transactions:
 *   get:
 *     summary: Get all remote transactions
 *     tags:
 *       - RemoteTransaction
 *     responses:
 *       200:
 *         description: List of remote transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RemoteTransaction'
 *       500:
 *         description: Internal server error
 */
router.get("/", RemoteTransactionsController.getAll);

/**
 * @openapi
 * /api/remote-transactions/latest/{n}:
 *   get:
 *     summary: Get the latest N remote transactions
 *     tags:
 *       - RemoteTransaction
 *     parameters:
 *       - in: path
 *         name: n
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of latest transactions to retrieve
 *     responses:
 *       200:
 *         description: List of latest remote transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RemoteTransaction'
 *       400:
 *         description: Invalid number of latest transactions
 *       500:
 *         description: Internal server error
 */
router.get("/latest/:n", RemoteTransactionsController.getLatestN);

/**
 * @openapi
 * /api/remote-transactions/{id}:
 *   get:
 *     summary: Get a remote transaction by ID
 *     tags:
 *       - RemoteTransaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Remote transaction ID
 *     responses:
 *       200:
 *         description: Remote transaction found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemoteTransaction'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: No remote transaction found for ID
 *       500:
 *         description: Internal server error
 */
router.get("/:id", RemoteTransactionsController.getById);

/**
 * @openapi
 * /api/remote-transactions:
 *   post:
 *     summary: Create a new remote transaction
 *     tags:
 *       - RemoteTransaction
 *     parameters:
 *       - in: header
 *         name: initiator-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Initiator key
 *       - in: header
 *         name: socket-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Websocket connection ID
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
 *               - status
 *             properties:
 *               target_instance_id:
 *                 type: integer
 *               document_type_id:
 *                 type: integer
 *               file_name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [started, forwarded, finished, failed]
 *     responses:
 *       200:
 *         description: Remote transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemoteTransaction'
 *       400:
 *         description: Missing or invalid required fields, initiator key, or socket id
 *       404:
 *         description: No initiator found for initiator key
 *       500:
 *         description: Internal server error
 */
router.post("/", RemoteTransactionsController.create);

/**
 * @openapi
 * /api/remote-transactions/status/{id}:
 *   put:
 *     summary: Update the status of a remote transaction by ID
 *     tags:
 *       - RemoteTransaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Remote transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [started, forwarded, finished, failed]
 *     responses:
 *       200:
 *         description: Remote transaction status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemoteTransaction'
 *       400:
 *         description: Invalid ID format or invalid status
 *       404:
 *         description: No remote transaction found for ID
 *       500:
 *         description: Internal server error
 */
router.put("/status/:id", RemoteTransactionsController.updateStatus);

/**
 * @openapi
 * /api/remote-transactions/{id}:
 *   delete:
 *     summary: Delete a remote transaction by ID
 *     tags:
 *       - RemoteTransaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Remote transaction ID
 *     responses:
 *       200:
 *         description: Remote transaction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: No remote transaction found for ID
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", RemoteTransactionsController.delete);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     RemoteTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         initiator_id:
 *           type: integer
 *         target_instance_id:
 *           type: integer
 *         document_type_id:
 *           type: integer
 *         file_name:
 *           type: string
 *         status:
 *           type: string
 *           enum: [started, forwarded, finished, failed]
 *         socket_id:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */