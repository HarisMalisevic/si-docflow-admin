import { Router } from "express";
import AvailableDeviceController from "./AvailableDevice.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

/**
 * @swagger
 * /available-devices:
 *   get:
 *     summary: Get all available devices
 *     tags: [AvailableDevice]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available devices
 *       500:
 *         description: Internal server error
 */
router.get("/", AuthMiddleware.isLoggedIn, AvailableDeviceController.getAll);

/**
 * @swagger
 * /available-devices/{id}:
 *   get:
 *     summary: Get available device by ID
 *     tags: [AvailableDevice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device found
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.isLoggedIn,
  AvailableDeviceController.getById
);

/**
 * @swagger
 * /available-devices/app-instance/{instance_id}:
 *   get:
 *     summary: Get all available devices for a Windows app instance
 *     tags: [AvailableDevice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instance_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Windows app instance ID
 *     responses:
 *       200:
 *         description: List of devices for the instance
 *       400:
 *         description: Invalid instance ID
 *       500:
 *         description: Internal server error
 */
router.get(
  "/app-instance/:instance_id",
  AuthMiddleware.isLoggedIn,
  AvailableDeviceController.getByAppInstanceId
);

/**
 * @swagger
 * /available-devices/app-instance/chosen-device/{instance_id}:
 *   get:
 *     summary: Get the chosen device for a Windows app instance (HEADLESS mode only)
 *     tags: [AvailableDevice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instance_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Windows app instance ID
 *     responses:
 *       200:
 *         description: Chosen device for the instance
 *       400:
 *         description: Invalid instance ID or not in HEADLESS mode
 *       404:
 *         description: Instance or device not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/app-instance/chosen-device/:instance_id",
  AuthMiddleware.isLoggedIn,
  AvailableDeviceController.getChosenDeviceForInstance
)

/**
 * @swagger
 * /available-devices/app-instance/chosen-device/{instance_id}:
 *   put:
 *     summary: Set the chosen device for a Windows app instance (HEADLESS mode only)
 *     tags: [AvailableDevice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instance_id
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
 *               device_id:
 *                 type: integer
 *                 nullable: true
 *                 description: Device ID to set as chosen, or null to un-choose all
 *     responses:
 *       200:
 *         description: Chosen device set or all devices un-chosen
 *       400:
 *         description: Invalid instance/device ID or not in HEADLESS mode
 *       404:
 *         description: Instance or device not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/app-instance/chosen-device/:instance_id",
  AuthMiddleware.isLoggedIn,
  AvailableDeviceController.setChosenDeviceForInstance
)

export default router;
