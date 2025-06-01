import { Router } from "express";
import WindowsAppInstanceController from "./WindowsAppInstance.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

/**
 * @openapi
 * /api/windows-app-instance:
 *   get:
 *     summary: Get all Windows app instances
 *     tags:
 *       - WindowsAppInstance
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of Windows app instances
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WindowsAppInstance'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.getAll);

/**
 * @openapi
 * /api/windows-app-instance/{id}:
 *   get:
 *     summary: Get a Windows app instance by ID
 *     tags:
 *       - WindowsAppInstance
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Windows app instance ID
 *     responses:
 *       200:
 *         description: Windows app instance found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WindowsAppInstance'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Windows app instance not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.getById);

/**
 * @openapi
 * /api/windows-app-instance/machine/{machine_id}:
 *   get:
 *     summary: Get a Windows app instance by machine ID (no auth)
 *     tags:
 *       - WindowsAppInstance
 *     parameters:
 *       - in: path
 *         name: machine_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ID
 *     responses:
 *       200:
 *         description: Windows app instance found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WindowsAppInstance'
 *       404:
 *         description: Windows app instance not found
 *       500:
 *         description: Internal server error
 */
router.get("/machine/:machine_id", WindowsAppInstanceController.getByMachineId);

/**
 * @openapi
 * /api/windows-app-instance:
 *   post:
 *     summary: Create a new Windows app instance
 *     tags:
 *       - WindowsAppInstance
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
 *               - location
 *               - machine_id
 *               - operational_mode
 *               - polling_frequency
 *             properties:
 *               title:
 *                 type: string
 *               location:
 *                 type: string
 *               machine_id:
 *                 type: string
 *               operational_mode:
 *                 type: string
 *                 enum: [headless, standalone]
 *               polling_frequency:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Windows app instance created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WindowsAppInstance'
 *       400:
 *         description: Missing or invalid required fields
 *       401:
 *         description: Unauthorized or invalid user data
 *       500:
 *         description: Internal server error
 */
router.post("/", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.create);

/**
 * @openapi
 * /api/windows-app-instance/{id}:
 *   put:
 *     summary: Update a Windows app instance by ID
 *     tags:
 *       - WindowsAppInstance
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Windows app instance ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               location:
 *                 type: string
 *               machine_id:
 *                 type: string
 *               operational_mode:
 *                 type: string
 *                 enum: [headless, standalone]
 *               polling_frequency:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Windows app instance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WindowsAppInstance'
 *       400:
 *         description: Invalid ID format or invalid input
 *       401:
 *         description: Unauthorized or invalid user data
 *       404:
 *         description: Windows app instance not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.update);

/**
 * @openapi
 * /api/windows-app-instance/{id}:
 *   delete:
 *     summary: Delete a Windows app instance by ID
 *     tags:
 *       - WindowsAppInstance
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Windows app instance ID
 *     responses:
 *       200:
 *         description: Windows app instance deleted successfully
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Windows app instance not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.delete);

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     WindowsAppInstance:
 *       type: object
 *       required:
 *         - title
 *         - location
 *         - machine_id
 *         - operational_mode
 *         - polling_frequency
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         location:
 *           type: string
 *         machine_id:
 *           type: string
 *         operational_mode:
 *           type: string
 *           enum: [headless, standalone]
 *         polling_frequency:
 *           type: integer
 *         created_by:
 *           type: integer
 *           nullable: true
 *         updated_by:
 *           type: integer
 *           nullable: true
 */