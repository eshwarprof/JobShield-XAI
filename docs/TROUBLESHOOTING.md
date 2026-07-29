# Troubleshooting

## AI service returns 503 on every `/analyze/*` call

No trained model exists yet. Run:

```bash
cd ai_service
.venv\Scripts\python -m bert_model.train_model
.venv\Scripts\python -m xai.shap_explainer
```

`models_store/latest.json` must exist and point at a real version directory before the service can serve predictions (see `docs/ARCHITECTURE.md`'s model-versioning section).

## `pip install torch` gives a CPU-only build even though I have a GPU

Confirmed on this project's own dev machine (Windows, RTX 4060): the default PyPI `torch` wheel resolves to CPU-only. Install the CUDA build explicitly first:

```bash
pip install torch==2.13.0 torchvision==0.28.0 --index-url https://download.pytorch.org/whl/cu130
pip install -r requirements.txt
```

Check with `python -c "import torch; print(torch.cuda.is_available())"`. If your driver is older, the available CUDA tags may differ — check `https://download.pytorch.org/whl/torch/` for what's built for your torch version.

## `docker compose build` fails on `npm ci` with an `optionalDependencies`/lockfile mismatch

Known cross-platform issue: a lockfile generated on Windows doesn't always carry the Linux-specific native-binary entries (seen here with Tailwind v4's `lightningcss`). Both Dockerfiles use `npm install` instead of `npm ci` for exactly this reason — if you've changed them back, that's why it broke.

## The AI service Docker image is huge / build pulls several GB of CUDA libraries

Plain `pip install torch` inside a Linux container resolves a CUDA-enabled build by default and drags in `nvidia-cudnn-*`/`cuda-toolkit` packages even though `docker-compose.yml` requests no GPU. `ai_service/Dockerfile` installs the CPU-only build explicitly first (`--index-url https://download.pytorch.org/whl/cpu`) so the subsequent `requirements.txt` install sees `torch==2.13.0` already satisfied and leaves it alone. If you need GPU inference in the container, remove that line and add GPU device reservations to the compose file instead.

## URL analysis fails with "resolves to a non-public address"

Working as intended (NFR-7 SSRF protection) — the target hostname resolved to a private/loopback/link-local IP. This will also reject `localhost` and internal service names by design.

## `EmscadDataset` / preprocessing crashes on `unicodedata.normalize`

Fixed in this codebase (see the Phase 4 commit) — pandas represents a missing CSV cell as `float('nan')`, which is truthy in Python and used to slip past `clean_text`'s missing-value guard. If you see this again in new code, make sure any pandas-sourced field goes through `ai_service/preprocessing/text_cleaning.py`'s `clean_text`, which now explicitly checks `isinstance(text, str)`.

## A SHAP/LIME chart shows a color that doesn't match "red = fraudulent, green = legitimate"

Also fixed in this codebase (Phase 9 commit) — make sure `ExplanationBarChart` is always given a **signed** value (`weight` for LIME, `mean_impact` for SHAP), never `mean_abs_impact`, which is always non-negative and would make every bar look "fraudulent" regardless of its real direction.
