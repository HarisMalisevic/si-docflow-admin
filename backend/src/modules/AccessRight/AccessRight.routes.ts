import { Router } from "express";
import AccessRightsController from "./AccessRight.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

/**
 * @openapi
 * /api/access-rights:
 *   get:
 *     summary: Get all access rights
 *     tags:
 *       - AccessRight
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of access rights
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AccessRight'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  AuthMiddleware.isLoggedIn,
  AccessRightsController.getAll
);

/**
 * @openapi
 * /api/access-rights/{id}:
 *   get:
 *     summary: Get an access right by ID
 *     tags:
 *       - AccessRight
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Access right ID
 *     responses:
 *       200:
 *         description: Access right found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessRight'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Access right not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  AuthMiddleware.isLoggedIn,
  AccessRightsController.getById
);

/**
 * @openapi
 * /api/access-rights:
 *   post:
 *     summary: Create a new access right
 *     tags:
 *       - AccessRight
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access right created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  AuthMiddleware.isLoggedIn,
  AccessRightsController.create
);

/**
 * @openapi
 * /api/access-rights/{id}:
 *   put:
 *     summary: Update an access right by ID
 *     tags:
 *       - AccessRight
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Access right ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access right updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Access right not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  AuthMiddleware.isLoggedIn,
  AccessRightsController.update
);

/**
 * @openapi
 * /api/access-rights/{id}:
 *   delete:
 *     summary: Delete an access right by ID
 *     tags:
 *       - AccessRight
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Access right ID
 *     responses:
 *       200:
 *         description: Access right deleted successfully
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
 *         description: Access right not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  AuthMiddleware.isLoggedIn,
  AccessRightsController.delete
)

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     AccessRight:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 */
