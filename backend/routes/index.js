const express = require("express");
const authRoutes = require("./authRoutes");
const analysisRoutes = require("./analysisRoutes");
const historyRoutes = require("./historyRoutes");

const router = express.Router();

router.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

router.use("/auth", authRoutes);
router.use("/analyze", analysisRoutes);
router.use("/history", historyRoutes);

module.exports = router;
