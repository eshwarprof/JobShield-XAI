const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     summary: Aggregate platform statistics (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Total users/analyses and risk/label breakdowns. }
 *       403: { description: Not an admin. }
 */
router.get("/stats", adminController.getStats);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Paginated user list (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated users. }
 *       403: { description: Not an admin. }
 */
router.get("/users", adminController.listUsers);

/**
 * @openapi
 * /admin/users/{id}/role:
 *   put:
 *     summary: Update a user's role (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200: { description: Updated user. }
 *       400: { description: Invalid role or self-modification. }
 *       403: { description: Not an admin. }
 *       404: { description: User not found. }
 */
router.put("/users/:id/role", adminController.updateUserRole);

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user and their analyses (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User deleted. }
 *       400: { description: Self-deletion blocked. }
 *       403: { description: Not an admin. }
 *       404: { description: User not found. }
 */
router.delete("/users/:id", adminController.deleteUser);

/**
 * @openapi
 * /admin/analyses:
 *   get:
 *     summary: Paginated list of all system analyses (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated analyses with user info. }
 *       403: { description: Not an admin. }
 */
router.get("/analyses", adminController.listAnalyses);

module.exports = router;
