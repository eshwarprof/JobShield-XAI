jest.mock("../utils/aiServiceClient");

const request = require("supertest");
const createApp = require("../app");
const aiService = require("../utils/aiServiceClient");
const Analysis = require("../models/Analysis");

const app = createApp();

const mockAiResult = {
  extractedText: "urgent hiring pay a fee",
  fraudProbability: 0.92,
  predictionLabel: "fraudulent",
  trustScore: 10,
  trustBand: "Very Low Trust",
  riskCategory: "Critical",
  severityScore: 90,
  severityFlags: ["registration_fee_requested"],
  shapExplanation: { top_features: [] },
  limeExplanation: { top_features: [] },
  decision: {
    recommendation: "Do NOT apply.",
    warnings: ["Critical warning: registration fee requested."],
    verificationSuggestions: ["Verify the company's official website."],
  },
};

let accessToken;

beforeEach(async () => {
  // Register a test user before each test to have a clean auth state
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Analysis Tester", email: "tester@example.com", password: "supersecret123" });
  accessToken = res.body.accessToken;
});

describe("Analysis routes", () => {
  test("POST /analyze/text persists and returns a full analysis", async () => {
    aiService.analyzeText.mockResolvedValue(mockAiResult);

    const res = await request(app)
      .post("/api/analyze/text")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ text: "urgent hiring pay a fee" });

    expect(res.status).toBe(201);
    expect(res.body.riskCategory).toBe("Critical");
    expect(res.body.recommendations).toEqual([
      "Do NOT apply.",
      "Verify the company's official website.",
    ]);
    expect(res.body.warnings).toEqual(mockAiResult.decision.warnings);

    const stored = await Analysis.findById(res.body._id);
    expect(stored).not.toBeNull();
    expect(stored.inputType).toBe("text");
  });

  test("POST /analyze/text rejects empty text", async () => {
    const res = await request(app)
      .post("/api/analyze/text")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ text: "   " });
    expect(res.status).toBe(422);
  });

  test("POST /analyze/url rejects a malformed URL", async () => {
    const res = await request(app)
      .post("/api/analyze/url")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ url: "not-a-url" });
    expect(res.status).toBe(422);
  });

  test("POST /analyze/url surfaces a clear error when the AI service is unreachable", async () => {
    const ApiError = require("../utils/ApiError");
    aiService.analyzeUrl.mockRejectedValue(new ApiError(503, "The analysis service is currently unavailable."));

    const res = await request(app)
      .post("/api/analyze/url")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ url: "https://example.com/job" });
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/unavailable/i);
  });

  test("GET /analyze/:id returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/analyze/507f1f77bcf86cd799439011");
    expect(res.status).toBe(404);
  });

  test("GET /analyze/:id rejects a malformed id", async () => {
    const res = await request(app).get("/api/analyze/not-an-id");
    expect(res.status).toBe(422);
  });

  test("anonymous analyses (no userId) are readable by anyone with the id", async () => {
    const analysis = await Analysis.create({
      inputType: "text",
      sourceReference: "anonymous submission",
      extractedText: "anonymous submission",
      fraudProbability: 0.1,
      predictionLabel: "legitimate",
      trustScore: 90,
      trustBand: "Highly Trustworthy",
      riskCategory: "Low",
      severityScore: 0,
      severityFlags: [],
      recommendations: ["Appears trustworthy"],
      warnings: [],
    });

    const getRes = await request(app).get(`/api/analyze/${analysis._id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.sourceReference).toBe("anonymous submission");
  });
});
