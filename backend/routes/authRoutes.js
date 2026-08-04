const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const { requireAuth } = require("../middleware/auth");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user account (FR-11.2)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Account created; returns the user and an access token. }
 *       409: { description: Email already registered. }
 *       422: { description: Validation failed. }
 */
router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 100 }),
    body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
  ],
  validate,
  authController.register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Returns the user and an access token; sets an httpOnly refresh cookie. }
 *       401: { description: Invalid credentials. }
 */
router.post(
  "/login",
  authLimiter,
  [
    body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  authController.login
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Exchange the httpOnly refresh cookie for a new access token
 *     tags: [Auth]
 *     responses:
 *       200: { description: Returns a new access token; rotates the refresh cookie. }
 *       401: { description: Refresh token missing, invalid, expired, or revoked. }
 */
router.post("/refresh", authLimiter, authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Clear the current session's refresh cookie
 *     tags: [Auth]
 *     responses:
 *       204: { description: Logged out. }
 */
router.post("/logout", authController.logout);

/**
 * @openapi
 * /auth/logout-all:
 *   post:
 *     summary: Invalidate every outstanding refresh token for this account
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: All sessions logged out. }
 *       401: { description: Authentication required. }
 */
router.post("/logout-all", requireAuth, authController.logoutAll);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: The current user. }
 *       401: { description: Authentication required. }
 */
router.get("/me", requireAuth, authController.me);

/**
 * @openapi
 * /auth/google:
 *   post:
 *     summary: Authenticate with a Google account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential: { type: string, description: Google ID token JWT }
 *               mockProfile:
 *                 type: object
 *                 properties:
 *                   email: { type: string }
 *                   name: { type: string }
 *     responses:
 *       200: { description: Successful authentication. }
 *       400: { description: Invalid parameters. }
 */
router.post("/google", authLimiter, authController.googleLogin);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: OTP sent successfully or generic success. }
 *       400: { description: Validation error. }
 */
router.post(
  "/forgot-password",
  authLimiter,
  [body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail()],
  validate,
  authController.forgotPassword
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Verify OTP and reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, password]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Password updated successfully. }
 *       400: { description: Invalid or expired OTP. }
 */
router.post(
  "/reset-password",
  authLimiter,
  [
    body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("otp").trim().notEmpty().withMessage("OTP is required."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long."),
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
