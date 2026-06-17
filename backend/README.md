---
title: RuralCare AI Triage API
emoji: 🏥
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# RuralCare AI Triage Backend

FastAPI service powering the RuralCare multilingual triage system.
- ASR (Whisper), OCR (Bengali prescriptions), vitals anomaly detection
- AI triage (Puku AI → OpenAI gpt-4o-mini → offline heuristic)
- PDF triage reports

Endpoints:
- `GET /health` — liveness
- `GET /docs` — Swagger UI
- `POST /triage` — main triage endpoint
- `POST /transcribe` — speech-to-text
- `POST /ocr` — prescription OCR
- `POST /pdf-report` — generate PDF
