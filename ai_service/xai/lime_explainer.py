"""Module 7 (local half) — LIME per-advertisement explanation (SRS FR-8.2-8.4).

Runs live, per request — unlike the SHAP global explanation (NFR-2), LIME's
cost scales with one instance's perturbation budget, not the whole model, so
recomputing it synchronously per analysis is the correct trade-off.
"""
from __future__ import annotations

from lime.lime_text import LimeTextExplainer

from ai_service.bert_model.predict import predict_proba_batch

CLASS_NAMES = ["legitimate", "fraudulent"]
DEFAULT_NUM_FEATURES = 10
DEFAULT_NUM_SAMPLES = 500


def generate_local_explanation(
    text: str, num_features: int = DEFAULT_NUM_FEATURES, num_samples: int = DEFAULT_NUM_SAMPLES
) -> dict:
    """FR-8.2/8.3/8.4: word-level contributions for this specific prediction,
    as ranked (word, weight) pairs — already human-readable words, not token
    ids, satisfying FR-8.4 without extra mapping."""
    explainer = LimeTextExplainer(class_names=CLASS_NAMES)

    explanation = explainer.explain_instance(
        text,
        predict_proba_batch,
        num_features=num_features,
        num_samples=num_samples,
        labels=(1,),  # explain the "fraudulent" class specifically
    )

    ranked = [
        {"feature": word, "weight": weight}
        for word, weight in explanation.as_list(label=1)
    ]
    return {
        "type": "lime_local",
        "target_class": "fraudulent",
        "features": ranked,
    }
