from typing import Any

from pydantic import BaseModel


class DecisionSupport(BaseModel):
    recommendation: str
    warnings: list[str]
    verificationSuggestions: list[str]


class CompanyVerification(BaseModel):
    searched: bool
    companyName: str | None = None
    officialWebsite: str | None = None
    linkedinPage: str | None = None
    summary: str | None = None
    error: str | None = None


class AnalysisResponse(BaseModel):
    extractedText: str
    fraudProbability: float
    predictionLabel: str
    trustScore: int
    trustBand: str
    riskCategory: str
    severityScore: int
    severityFlags: list[str]
    shapExplanation: dict[str, Any]
    limeExplanation: dict[str, Any]
    decision: DecisionSupport
    companyVerification: CompanyVerification | None = None


class ErrorResponse(BaseModel):
    status: int
    error: str
