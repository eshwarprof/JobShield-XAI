# Explainable Fake Job Advertisement Detection Framework

An explainable, trust-aware recruitment-fraud detection platform. Extends the Fraud-BERT baseline (Taneja, Vashishtha & Ratnoo, *Discover Computing*, 2025) with SHAP/LIME explainability, a deterministic Trust Score engine, Risk Categorization, Fraud Severity assessment, and a Decision Support engine — all served through a single Explainability Dashboard.

> Full requirements: see the project's SRS (Software Requirements Specification). This README is the operational entry point; architecture/design rationale lives in [`docs/`](docs/) (populated in later build phases).

## Status

This repository is being built incrementally, phase by phase. Current state:

- [x] Dataset acquired and verified (EMSCAD — 17,880 postings, schema-checked against public record)
- [x] Repository scaffold
- [ ] EDA + preprocessing pipeline
- [ ] BERT fine-tuning pipeline
- [ ] Trust / Risk / Severity / Decision Support engines
- [ ] SHAP + LIME explainability
- [ ] FastAPI AI service
- [ ] Node/Express backend
- [ ] React frontend
- [ ] Multi-input channels (URL / PDF / OCR)
- [ ] Test suites
- [ ] Docker + CI/CD
- [ ] Full documentation set

## Architecture

Three-tier: **React frontend** → **Node.js/Express backend** (auth, validation, orchestration) → **Python/FastAPI AI service** (preprocessing, BERT inference, trust/risk/severity/decision engines, SHAP/LIME), with **MongoDB** persisting every analysis.

## Repository layout

```
ai_service/            Python AI service (FastAPI)
  dataset/             EMSCAD CSV (fetched, not committed) + download_dataset.py
  config/              Centralized business-rule constants (trust/risk/severity thresholds)
  preprocessing/        Text cleaning, tokenization
  bert_model/          Fine-tuning + inference for the fraud classifier
  trust_engine/        Module 3 — Trust Score
  risk_engine/         Module 4 — Risk Categorization
  severity_engine/     Module 5 — Fraud Severity
  decision_support/    Module 6 — recommendations/warnings
  xai/                 Module 7 — SHAP (global) + LIME (local)
  input_processing/    URL scraping, PDF extraction, OCR
  schemas/             Pydantic request/response models
  tests/               pytest suite

backend/               Node.js/Express backend (MVC)
  config/ controllers/ routes/ models/ middleware/ utils/ tests/

frontend/              React (Vite) SPA — input forms + Explainability Dashboard
docs/                  Architecture, API, deployment, user documentation
```

## Getting started (local development)

Each tier's own README (added as that tier is built) documents its exact setup. At a high level:

```bash
# 1. Dataset (already fetched into ai_service/dataset/; re-verify anytime)
python ai_service/dataset/download_dataset.py

# 2. AI service (Python)
cd ai_service
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt

# 3. Backend (Node.js)
cd backend
npm install
cp .env.example .env

# 4. Frontend (React) — added in a later phase
```

## License

Academic/research project. EMSCAD is used strictly for training/evaluation per its public Kaggle licensing (see `ai_service/dataset/README.md`).
