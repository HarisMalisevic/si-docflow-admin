import { Router } from "express";
import ProcessingRuleDestinationController from "./ProcessingRuleDestination.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

/**
 * @openapi
 * /api/processing-rules/destinations:
 *   get:
 *     summary: Get all processing rule destinations
 *     tags:
 *       - ProcessingRuleDestination
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of processing rule destinations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessingRuleDestination'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAll
);

/**
 * @openapi
 * /api/processing-rules/destinations/document-type/{id}:
 *   get:
 *     summary: Get all destinations by document type ID
 *     tags:
 *       - ProcessingRuleDestination
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document type ID
 *     responses:
 *       200:
 *         description: List of destinations for the document type
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessingRuleDestination'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/document-type/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByDocumentTypeId
);

/**
 * @openapi
 * /api/processing-rules/destinations/api/{id}:
 *   get:
 *     summary: Get all destinations by API endpoint ID
 *     tags:
 *       - ProcessingRuleDestination
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: API endpoint ID
 *     responses:
 *       200:
 *         description: List of destinations for the API endpoint
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessingRuleDestination'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/api/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByApiId
);

/**
 * @openapi
 * /api/processing-rules/destinations/ftp/{id}:
 *   get:
 *     summary: Get all destinations by FTP endpoint ID
 *     tags:
 *       - ProcessingRuleDestination
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: FTP endpoint ID
 *     responses:
 *       200:
 *         description: List of destinations for the FTP endpoint
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessingRuleDestination'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/ftp/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByFtpId
);

/**
 * @openapi
 * /api/processing-rules/destinations/local/{id}:
 *   get:
 *     summary: Get all destinations by local folder ID
 *     tags:
 *       - ProcessingRuleDestination
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Local storage folder ID
 *     responses:
 *       200:
 *         description: List of destinations for the local folder
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessingRuleDestination'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/local/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByLocalFolderId
);

/**
 * @openapi
 * /api/processing-rules/destinations:
 *   post:
 *     summary: Create a new processing rule destination
 *     tags:
 *       - ProcessingRuleDestination
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - processing_rule_id
 *             properties:
 *               processing_rule_id:
 *                 type: integer
 *               api_id:
 *                 type: integer
 *                 nullable: true
 *               ftp_id:
 *                 type: integer
 *                 nullable: true
 *               local_folder_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Processing rule destination created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ProcessingRuleDestination'
 *       400:
 *         description: Only one of api_id, ftp_id, or local_folder_id can be non-null or failed to create
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.create
);

/**
 * @openapi
 * /api/processing-rules/destinations/{id}:
 *   put:
 *     summary: Update a processing rule destination by ID
 *     tags:
 *       - ProcessingRuleDestination
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Processing rule destination ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               document_type_id:
 *                 type: integer
 *               api_id:
 *                 type: integer
 *                 nullable: true
 *               ftp_id:
 *                 type: integer
 *                 nullable: true
 *               local_folder_id:
 *                 type: integer
 *                 nullable: true
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Processing rule destination updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Only one of api_id, ftp_id, or local_folder_id can be non-null or failed to update
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Processing rule destination not found
 *       500:
 *         description: Internal server error
 */
router.put(
    "/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.update
);

/**
 * @openapi
 * /api/processing-rules/destinations/{id}:
 *   delete:
 *     summary: Delete a processing rule destination by ID
 *     tags:
 *       - ProcessingRuleDestination
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Processing rule destination ID
 *     responses:
 *       200:
 *         description: Processing rule destination deleted successfully
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
 *         description: Processing rule destination not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.delete
);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     ProcessingRuleDestination:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         processing_rule_id:
 *           type: integer
 *         local_storage_folder_id:
 *           type: integer
 *           nullable: true
 *         external_api_endpoint_id:
 *           type: integer
 *           nullable: true
 *         external_ftp_endpoint_id:
 *           type: integer
 *           nullable: true
 *         created_by:
 *           type: integer
 *         updated_by:
 *           type: integer
 *           nullable: true
 */
