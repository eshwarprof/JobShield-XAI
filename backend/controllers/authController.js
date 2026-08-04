const bcrypt = require("bcrypt");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const env = require("../config/env");
const { sendResetOtpEmail } = require("../utils/email");
const logger = require("../utils/logger");

const BCRYPT_ROUNDS = 12;

/** Refresh token lives in an httpOnly cookie (not readable by JS, so an XSS
 * bug can't exfiltrate it) — only the short-lived access token goes in the
 * JSON response body for the SPA to hold in memory. */
const REFRESH_COOKIE_NAME = "refreshToken";
const refreshCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};

function issueTokens(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  return accessToken;
}

/** FR-11.2: optional registration so history (FR-10) can be tied to an account. */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });

  const accessToken = issueTokens(res, user);
  res.status(201).json({ user, accessToken });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }
  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const accessToken = issueTokens(res, user);
  res.status(200).json({ user, accessToken });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw new ApiError(401, "No refresh token provided.");
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Refresh token is invalid or expired.");
  }

  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw new ApiError(401, "Refresh token has been revoked.");
  }

  const accessToken = issueTokens(res, user); // rotate refresh token
  res.status(200).json({ accessToken });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  res.status(204).send();
});

/** Invalidates every outstanding refresh token for this user immediately. */
const logoutAll = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  res.status(204).send();
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  res.status(200).json({ user });
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential, mockProfile } = req.body;
  let email, name;

  if (credential) {
    try {
      const payload = JSON.parse(Buffer.from(credential.split(".")[1], "base64").toString("utf-8"));
      email = payload.email;
      name = payload.name;
    } catch (err) {
      throw new ApiError(400, "Invalid Google credential.");
    }
  } else if (mockProfile) {
    email = mockProfile.email;
    name = mockProfile.name;
  } else {
    throw new ApiError(400, "Missing Google credential or profile.");
  }

  if (!email) {
    throw new ApiError(400, "Google profile must contain an email.");
  }

  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const dummyPassword = Math.random().toString(36) + Math.random().toString(36);
    const passwordHash = await bcrypt.hash(dummyPassword, BCRYPT_ROUNDS);
    user = await User.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      passwordHash,
    });
  }

  const accessToken = issueTokens(res, user);
  res.status(200).json({ user, accessToken });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "This email address is not registered.");
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetOtp = otpCode;
  user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  await user.save();

  await sendResetOtpEmail(user.email, otpCode);

  res.status(200).json({ message: "OTP sent successfully to your email." });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    throw new ApiError(400, "Email, OTP, and password are required.");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long.");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  user.passwordHash = passwordHash;
  user.resetOtp = null;
  user.resetOtpExpires = null;
  user.tokenVersion += 1;
  await user.save();

  res.status(200).json({ message: "Password updated successfully." });
});

module.exports = { register, login, refresh, logout, logoutAll, me, googleLogin, forgotPassword, resetPassword };
