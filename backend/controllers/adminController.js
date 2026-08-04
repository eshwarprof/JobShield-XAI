const User = require("../models/User");
const Analysis = require("../models/Analysis");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/** Minimal System Administrator support (SRS 2.3 lists this as a future
 * role — kept intentionally small: aggregate visibility, not full user
 * management, since the SRS doesn't specify moderation actions for it). */
const getStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalAnalyses, riskCounts, labelCounts] = await Promise.all([
    User.countDocuments(),
    Analysis.countDocuments(),
    Analysis.aggregate([{ $group: { _id: "$riskCategory", count: { $sum: 1 } } }]),
    Analysis.aggregate([{ $group: { _id: "$predictionLabel", count: { $sum: 1 } } }]),
  ]);

  const riskCategoryCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  riskCounts.forEach((row) => {
    riskCategoryCounts[row._id] = row.count;
  });

  const predictionLabelCounts = { fraudulent: 0, legitimate: 0 };
  labelCounts.forEach((row) => {
    predictionLabelCounts[row._id] = row.count;
  });

  res.status(200).json({ totalUsers, totalAnalyses, riskCategoryCounts, predictionLabelCounts });
});

const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);

  res.status(200).json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role. Role must be 'user' or 'admin'.");
  }

  if (req.params.id === req.user.id) {
    throw new ApiError(400, "You cannot modify your own role.");
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.status(200).json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new ApiError(400, "You cannot delete your own account.");
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Delete all associated analyses
  await Analysis.deleteMany({ userId: req.params.id });

  res.status(200).json({ message: "User and associated analyses deleted successfully." });
});

const listAnalyses = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const [analyses, total] = await Promise.all([
    Analysis.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Analysis.countDocuments(),
  ]);

  res.status(200).json({
    analyses,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

module.exports = { getStats, listUsers, updateUserRole, deleteUser, listAnalyses };
