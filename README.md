# Explainable Fake Job Advertisement Detection Framework

An explainable, trust-aware recruitment-fraud detection platform. Extends the Fraud-BERT baseline (Taneja, Vashishtha & Ratnoo, *Discover Computing*, 2025) with SHAP/LIME explainability, a deterministic Trust Score engine, Risk Categorization, Fraud Severity assessment, and a Decision Support engine — all served through a single Explainability Dashboard.

## Status

- [x] Dataset acquired and verified (EMSCAD — 17,880 postings, schema-checked against public record)
- [x] Repository scaffold
- [x] EDA + preprocessing pipeline
- [x] BERT fine-tuning pipeline (accuracy 98.73% / F1 0.863 held-out — see `docs/model_evaluation_report.md`)
- [x] Trust / Risk / Severity / Decision Support engines
- [x] SHAP + LIME explainability
- [x] FastAPI AI service
- [x] Node/Express backend
- [x] React frontend
- [x] Multi-input channels (URL / PDF / OCR)
- [x] Test suites (ai_service, backend, frontend)
- [x] Docker + CI/CD
- [x] Full documentation set

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — three-tier design, the analysis pipeline, model versioning
- [`docs/API.md`](docs/API.md) — endpoint map (full interactive docs at `/api-docs` and `/docs`)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — local, Docker, and production deployment
- [`docs/TESTING.md`](docs/TESTING.md) — how to run every test suite, and what each covers
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) — known gotchas and how to fix them
- [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) — how to use the deployed app
- [`docs/RESEARCH_CONTRIBUTION.md`](docs/RESEARCH_CONTRIBUTION.md) — novelty, results, and honest limitations
- [`docs/eda/eda_report.md`](docs/eda/eda_report.md) — EMSCAD exploratory analysis
- [`docs/model_evaluation_report.md`](docs/model_evaluation_report.md) — held-out test metrics

## Architecture

Three-tier: **React frontend** → **Node.js/Express backend** (auth, validation, orchestration) → **Python/FastAPI AI service** (preprocessing, BERT inference, trust/risk/severity/decision engines, SHAP/LIME), with **MongoDB** persisting every analysis. Full diagram and rationale in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Repository layout

```
ai_service/            Python AI service (FastAPI)
  dataset/             EMSCAD CSV (fetched, not committed) + download_dataset.py
  config/              Centralized business-rule constants (trust/risk/severity thresholds)
  preprocessing/       Text cleaning, tokenization
  bert_model/          Fine-tuning + inference for the fraud classifier
  trust_engine/        Module 3 — Trust Score
  risk_engine/         Module 4 — Risk Categorization
  severity_engine/     Module 5 — Fraud Severity
  decision_support/    Module 6 — recommendations/warnings
  xai/                 Module 7 — SHAP (global) + LIME (local)
  input_processing/    URL scraping, PDF extraction, OCR
  schemas/              Pydantic request/response models
  routes/, app.py, pipeline.py    FastAPI wiring
  tests/               pytest suite

backend/               Node.js/Express backend (MVC)
  config/ controllers/ routes/ models/ middleware/ utils/ tests/

frontend/              React (Vite + TypeScript + Tailwind) SPA
  src/api/ store/ components/ pages/ types/

docs/                  Architecture, API, deployment, user, research documentation
.github/workflows/     CI (pytest / Jest / Vitest on every push)
docker-compose.yml     Local containerized stack (MongoDB + all three tiers)
```

## Getting started (local development, no Docker)

```bash
# 1. Dataset (already fetched into ai_service/dataset/; re-verify anytime)
python ai_service/dataset/download_dataset.py

# 2. AI service (Python)
cd ai_service
python -m venv .venv
.venv\Scripts\activate      # Windows

# GPU (recommended — CPU-only inference is supported but training is much
# slower): install the CUDA build of torch first, matching your driver.
pip install torch==2.13.0 torchvision==0.28.0 --index-url https://download.pytorch.org/whl/cu130
pip install -r requirements.txt

# Train once (writes ai_service/models_store/, gitignored — not shipped in the repo)
python -m bert_model.train_model
python -m xai.shap_explainer   # precompute the SHAP global-explanation cache
python -m bert_model.evaluate  # optional: held-out test metrics -> docs/model_evaluation_report.md

uvicorn ai_service.app:app --reload --port 8000

# 3. Backend (Node.js), in a second terminal
cd backend
npm install
copy .env.example .env   # then fill in real secrets for anything beyond local dev
npm run dev

# 4. Frontend (React), in a third terminal
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173 — Backend docs: http://localhost:5000/api-docs — AI service docs: http://localhost:8000/docs

## Getting started (Docker Compose)

```bash
docker compose build
docker compose up -d mongo
# Train once — writes into ai_service/models_store/, which is volume-mounted
# into the container (see docker-compose.yml comments):
cd ai_service && .venv\Scripts\python -m bert_model.train_model && python -m xai.shap_explainer && cd ..
docker compose up -d
```

Frontend: http://localhost — full details in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Testing

```bash
cd ai_service && .venv\Scripts\python -m pytest -q
cd backend && npx jest --runInBand
cd frontend && npx vitest run
```

See [`docs/TESTING.md`](docs/TESTING.md) for what each suite covers.

## License

Academic/research project. EMSCAD is used strictly for training/evaluation per its public Kaggle licensing (see `ai_service/dataset/README.md`).
