---
marp: true
theme: gaia
_class: lead
paginate: true
backgroundColor: #0f172a
color: #ffffff
style: |
  section {
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
  h1 {
    color: #3b82f6;
  }
  h2 {
    color: #60a5fa;
  }
  footer {
    font-size: 0.5em;
    color: #94a3b8;
  }
---

# Explainable Fake Job Advertisement Detection Framework

### A Trust-Aware, Auditable Decision Support System for Recruitment Fraud

**Presenter:** Project Team
**Baseline:** Fraud-BERT (Taneja et al., 2025)
**OS/Platform:** Windows / Docker-Ready

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 1. Introduction & Motivation

* **Recruitment Fraud Rise**: The rapid growth of digital platforms has led to a surge in fake job postings.
* **Impact**:
  * Financial extortion (registration fees, training costs).
  * Identity theft via personal detail harvesting.
  * Reputation damage for legitimate platforms.
* **Problem with Current Solutions**:
  * Most models act as black-box classifiers.
  * No explanation is provided for the "fraud" label.
  * No consideration of trust signals or warning indicators.

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 2. Base Paper vs. Proposed Work

| Feature | Fraud-BERT (Base Paper) | Our Extended Framework |
| :--- | :--- | :--- |
| **Model** | BERT-base-uncased | BERT-base-uncased (Fine-Tuned) |
| **Interpretability** | None (Black Box) | **SHAP** (Global) + **LIME** (Local) |
| **Trust Engine** | None | **Trust Score** (0–100, 8 Penalty Rules) |
| **Risk Metrics** | None | **4-Tier Risk** & **Fraud Severity** (0-100) |
| **Inputs** | Text fields | **Text, URL, PDF, and Image/OCR** |
| **Guidance** | None | **Decision Support & Actionable Verification** |

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 3. System Architecture

```
 ┌─────────────┐      HTTPS/JSON       ┌──────────────────┐      HTTP/JSON       ┌──────────────────┐
 │   React     │ ───────────────────▶ │  Node/Express    │ ───────────────────▶ │  FastAPI         │
 │  frontend   │ ◀─────────────────── │  backend (MVC)   │ ◀─────────────────── │  AI service      │
 └─────────────┘                       └──────────────────┘                       └──────────────────┘
                                                 │                                          │
                                                 ▼                                          ▼
                                           ┌──────────┐                            ┌──────────────────┐
                                           │ MongoDB  │                            │ BERT weights +   │
                                           └──────────┘                            │ SHAP cache (disk)│
                                                                                   └──────────────────┘
```

* **React Frontend**: Input ingestion (URL, PDF, Image) + Explainability Dashboard.
* **Node/Express Backend**: Auth, validation, rate limiting, and MongoDB logging.
* **Python FastAPI AI**: Tokenization, BERT inference, Trust/Severity engines, LIME, and SHAP.

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 4. Dataset & Preprocessing

* **Dataset (EMSCAD)**: 17,880 postings (17,014 legitimate, 866 fraudulent).
* **Severe Class Imbalance**: ~4.84% positive class.
  * **Solution**: Weighted cross-entropy loss applied during fine-tuning so the model doesn't collapse to predicting only legitimate postings.
* **Missingness Patterns as Signals**:
  * Legitimate posts are missing `company_profile` only 15.99% of the time.
  * Fraudulent posts are missing `company_profile` **67.78%** of the time.
  * This discrepancy justifies our high trust penalties for missing company fields.

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 5. AI Classification Pipeline

```
  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
  │ Multi-Input  │ ───▶ │ Preprocessing│ ───▶ │ BERT-based   │
  │ (PDF/OCR/URL)│      │  & Cleaning  │      │ Inference    │
  └──────────────┘      └──────────────┘      └──────────────┘
                                                     │
                                                     ▼
  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
  │ Explainable  │ ◀─── │  Scorecards  │ ◀─── │ Probability  │
  │ Dashboard    │      │ (Trust/Risk) │      │ Thresholding │
  └──────────────┘      └──────────────┘      └──────────────┘
```

1. **OCR / Scraping**: EasyOCR for screenshots, PyMuPDF for documents, scraping for URLs.
2. **Text Aggregation**: Cleans HTML tags, normalizes unicode, and bundles EMSCAD fields.
3. **BERT Classification**: Outputs fraud probability. Custom decision threshold set to **0.65**.

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 6. Explainable AI (XAI) Integration

* **Why XAI?**: Machine learning decisions must be auditable and trustable by job seekers.
* **LIME (Local Interpretable Model-agnostic Explanations)**:
  * Computes live word-level impact per request.
  * Color-codes words (green for legitimate, red for fraud) to show what influenced the prediction.
* **SHAP (SHapley Additive exPlanations)**:
  * Precomputes global feature importances across the dataset.
  * Cached on disk to provide general dataset-wide insight without slowing down requests.

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 7. Deterministic Trust Engine

* **Concept**: Avoid stacking a second opaque ML model on top of BERT. We use deterministic rules for transparency.
* **Trust Score (0–100)**: Evaluates 8 rule-based penalties:
  * **Free email domains** (e.g., gmail, yahoo) in contact details.
  * **Missing company profile** or website location.
  * **Requesting money** (registration fees).
  * **Urgency markers** ("apply immediately").
* **Score Mapping**:
  * `[90-100]`: High Trust | `[70-89]`: Moderate Trust
  * `[50-69]`: Low Trust | `<50`: Unreliable

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 8. Risk & Severity Engines

* **Fraud Severity (0–100)**: Calculates the danger level based on high-harm signals.
  * Financial requirements (e.g., bank accounts needed).
  * Lack of standard interview process.
  * Personal contact info (WhatsApp/Telegram recruitment).
* **Risk Categorization Matrix**:
  * Decomposes BERT fraud probability and Trust Score.
  * Categorizes results into **Low, Medium, High, or Critical** risk.
  * Example: Even with low BERT probability, if trust is extremely low, risk escalates to Medium.

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 9. Decision Support & User Flow

* **Actionable Recommendations**:
  * Low Risk: *"Verify application links prior to submitting sensitive information."*
  * Critical Risk: *"Do NOT apply. High probability of recruitment fraud detected."*
* **Detailed Warnings**: Displays specific triggers (e.g., fee requests) to alert the user.
* **Explainability Panels**: LIME and SHAP views are expandable so users can drill down.
* **User History Dashboard**: Saved scans allow users to track and filter past queries.

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 10. Model Performance Metrics

* **Evaluation Dataset**: 2,682 held-out test postings (never seen during training).
* **Performance Metrics**:
  * **Accuracy**: 98.73%
  * **Precision**: 90.68%
  * **Recall**: 82.31%
  * **F1-Score**: 0.863
  * **ROC-AUC**: 0.983
* **Validation**:
  * Reached 98.73% accuracy (base paper claims 99%).
  * Recall has room for improvement; future work includes focal loss and hyperparameter tuning.

---

<!-- _backgroundColor: #f8fafc -->
<!-- _color: #1e293b -->

## 11. Contributions & Future Scope

* **Core Novelty**: A unified pipeline matching state-of-the-art BERT accuracy with explainability (LIME/SHAP) and a transparent trust dashboard.
* **Key Achievements**:
  * Fully containerized multi-tier deployment.
  * Multi-input ingestion (URL, PDF, image OCR).
  * Integration tests ensuring zero regressions.
* **Future Directions**:
  * Real-time browser extension scanner.
  * Multilingual support for global job boards.
  * Active federated learning pipelines.

---

# Conclusion & Thank You

### Questions & Discussion

* **Repository Layout**:
  * `ai_service/` — FastAPI and AI scoring pipelines.
  * `backend/` — Express API gateway and Mongo persistence.
  * `frontend/` — React dashboard and XAI visualizations.
* **Documentation Available**:
  * ARCHITECTURE.md, USER_GUIDE.md, RESEARCH_CONTRIBUTION.md
