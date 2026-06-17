# RuralCare Triage 🩺

AI-powered multilingual triage for rural clinics. **Next.js** frontend + **FastAPI** backend with PostgreSQL, Whisper STT, prescription OCR, vitals anomaly detection, AI triage (Puku AI / OpenAI), and PDF report generation. Bengali 🇧🇩 and English.

## Repo layout

```
frontend/   # Next.js 15 + Tailwind (App Router) — patient UI
backend/    # FastAPI — AI triage, Whisper, OCR, PDF, Postgres
docker-compose.yml
railway.json
render.yaml
vercel.json
```

## Local development (one command)

```bash
cp .env.example .env
cp backend/.env.example backend/.env       # then add PUKU_API_KEY or OPENAI_API_KEY
docker compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000/docs
```

## Deploy today

**Option A — Render (recommended, single platform)**
1. Push this repo to GitHub.
2. In Render, click **New → Blueprint** and pick the repo. `render.yaml` provisions the Postgres DB, backend, and frontend.
3. Set `PUKU_API_KEY` (or `OPENAI_API_KEY`) on the backend service. The frontend gets the backend URL automatically.

**Option B — Vercel (frontend) + Render/Railway (backend)**
1. Deploy `backend/` to Render or Railway (Dockerfile is ready).
2. Deploy `frontend/` to Vercel; set `NEXT_PUBLIC_API_BASE` to the backend URL.

**Option C — Railway**
- Create a new project from this repo. Railway picks up `railway.json` and builds the backend Dockerfile.
- Add a Postgres plugin and bind it (it sets `DATABASE_URL`).
- Add `PUKU_API_KEY` env var.
- Add a second service for the frontend pointing at `frontend/Dockerfile`, with `NEXT_PUBLIC_API_BASE` pointing at the backend's public URL.

## Environment variables (backend)

| Key | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `PUKU_API_KEY` | Puku AI for triage (preferred) |
| `OPENAI_API_KEY` | Fallback LLM |
| `WHISPER_MODEL` | `tiny`, `base`, `small`, `medium` |
| `WHISPER_DEVICE` | `cpu` or `cuda` |
| `PDF_DIR` | Where to write generated PDFs |

## API surface

- `POST /triage` — full AI triage, persists to DB
- `POST /transcribe` — Whisper STT (audio blob, `lang=en|bn`)
- `POST /ocr` — Tesseract OCR on prescription images
- `GET  /report/{encounter_id}.pdf` — generated PDF report
- `GET  /health` — liveness probe

## Safety note

The triage engine is an **assistant, not a clinician**. Always confirm with a qualified medical professional.
