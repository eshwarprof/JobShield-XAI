"""Ties Modules 1-7 together into the single pipeline every input channel
routes through (FR-1.6): preprocessing -> BERT -> trust -> risk -> severity
-> decision support -> SHAP/LIME. Returns a single flat dict — the exact
contract the Node backend's analysisController.js persists (SRS 6.2.1) and
the frontend dashboard renders.
"""
from __future__ import annotations

from ai_service.bert_model.predict import predict_fraud_probability
from ai_service.decision_support.recommendation import generate_decision_support
from ai_service.preprocessing.text_cleaning import build_combined_text
from ai_service.risk_engine.risk_category import categorize_risk
from ai_service.severity_engine.severity_score import compute_severity_score
from ai_service.signals.detectors import detect_all_signals
from ai_service.trust_engine.trust_score import compute_trust_score
from ai_service.xai.explain import generate_explanations
from ai_service.verification.company_search import verify_company_details


class EmptyContentError(ValueError):
    """Raised when a fields dict has no usable text after cleaning."""


def build_raw_combined_text(fields: dict) -> str:
    parts = []
    # FIELD_ORDER contains fields like title, company_profile, description, etc.
    from ai_service.preprocessing.text_cleaning import FIELD_ORDER
    for field in FIELD_ORDER:
        val = fields.get(field)
        if isinstance(val, str) and val:
            parts.append(val)
    return " \n ".join(parts)


def run_analysis_pipeline(fields: dict) -> dict:
    cleaned_text = build_combined_text(fields)
    if not cleaned_text:
        raise EmptyContentError("No usable text content found in the submitted advertisement.")

    raw_text = build_raw_combined_text(fields)
    prediction = predict_fraud_probability(cleaned_text)
    signals = detect_all_signals(fields)
    trust = compute_trust_score(fields, signals=signals)
    severity = compute_severity_score(fields, signals=signals)

    # Calculate composite fraud probability: 60% BERT, 40% Distrust
    raw_bert_p = prediction["fraud_probability"]
    distrust_p = (100.0 - trust["score"]) / 100.0
    composite_p = 0.6 * raw_bert_p + 0.4 * distrust_p

    risk_category = categorize_risk(composite_p, trust["score"])
    decision = generate_decision_support(risk_category, severity)
    explanations = generate_explanations(cleaned_text)
    company_verification = verify_company_details(raw_text)

    return {
        "extractedText": cleaned_text,
        "fraudProbability": composite_p,
        "predictionLabel": prediction["prediction_label"],
        "trustScore": trust["score"],
        "trustBand": trust["band"],
        "riskCategory": risk_category,
        "severityScore": severity["score"],
        "severityFlags": severity["flags"],
        "shapExplanation": explanations["shap_global"],
        "limeExplanation": explanations["lime_local"],
        "decision": {
            "recommendation": decision["recommendation"],
            "warnings": decision["warnings"],
            "verificationSuggestions": decision["verification_suggestions"],
        },
        "companyVerification": company_verification,
    }
