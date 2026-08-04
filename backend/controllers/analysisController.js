const Analysis = require("../models/Analysis");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const aiService = require("../utils/aiServiceClient");

/** Persists the AI service's response in the shape defined by SRS Section
 * 6.2.1. The AI service's `decision` block (recommendation + verification
 * suggestions) is flattened into the schema's single `recommendations`
 * array — the SRS's proposed schema has one `recommendations` field, not a
 * separate one for verification suggestions, so the primary recommendation
 * is stored first followed by the suggestions. */
async function persistAnalysis({ userId, inputType, sourceReference, aiResult }) {
  const recommendations = [
    aiResult.decision.recommendation,
    ...aiResult.decision.verificationSuggestions,
  ];

  return Analysis.create({
    userId: userId || null,
    inputType,
    sourceReference,
    extractedText: aiResult.extractedText,
    fraudProbability: aiResult.fraudProbability,
    predictionLabel: aiResult.predictionLabel,
    trustScore: aiResult.trustScore,
    trustBand: aiResult.trustBand,
    riskCategory: aiResult.riskCategory,
    severityScore: aiResult.severityScore,
    severityFlags: aiResult.severityFlags,
    shapExplanation: aiResult.shapExplanation,
    limeExplanation: aiResult.limeExplanation,
    companyVerification: aiResult.companyVerification,
    recommendations,
    warnings: aiResult.decision.warnings,
  });
}

/** FR-1.1/UC-1: raw pasted text. */
const submitText = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const aiResult = await aiService.analyzeText(text);
  const analysis = await persistAnalysis({
    userId: req.user?.id,
    inputType: "text",
    sourceReference: text,
    aiResult,
  });
  res.status(201).json(analysis);
});

/** FR-1.2/UC-2: job-advertisement URL. */
const submitUrl = asyncHandler(async (req, res) => {
  const { url } = req.body;
  const aiResult = await aiService.analyzeUrl(url);
  const analysis = await persistAnalysis({
    userId: req.user?.id,
    inputType: "url",
    sourceReference: url,
    aiResult,
  });
  res.status(201).json(analysis);
});

/** FR-1.3/UC-3: PDF recruitment notice (multer has already validated type/size). */
const submitPdf = asyncHandler(async (req, res) => {
  const aiResult = await aiService.analyzePdf(req.file.buffer, req.file.originalname);
  const analysis = await persistAnalysis({
    userId: req.user?.id,
    inputType: "pdf",
    sourceReference: req.file.originalname,
    aiResult,
  });
  res.status(201).json(analysis);
});

/** FR-1.4/UC-4: screenshot/image via OCR. */
const submitImage = asyncHandler(async (req, res) => {
  const aiResult = await aiService.analyzeImage(req.file.buffer, req.file.originalname, req.file.mimetype);
  const analysis = await persistAnalysis({
    userId: req.user?.id,
    inputType: "image",
    sourceReference: req.file.originalname,
    aiResult,
  });
  res.status(201).json(analysis);
});

const getById = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findById(req.params.id);
  if (!analysis) {
    throw new ApiError(404, "Analysis not found.");
  }
  // A logged-in user may only reopen their own analyses; anonymous analyses
  // (userId === null) are reachable by whoever holds the id, matching FR-11.3.
  if (analysis.userId && (!req.user || String(analysis.userId) !== req.user.id)) {
    throw new ApiError(403, "You do not have permission to view this analysis.");
  }
  res.status(200).json(analysis);
});

module.exports = { submitText, submitUrl, submitPdf, submitImage, getById };
