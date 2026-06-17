# Deploying RuralCare Triage

The fastest path to production is **Render Blueprint** — it provisions Postgres,
the FastAPI backend, and the Next.js frontend from a single `render.yaml`.

## 1. Push to GitHub (already done)

```
https://github.com/NiLima-H/rural_health_ai
```

## 2. Get an OpenAI API key

1. Sign in at <https://platform.openai.com>
2. **Settings → Billing** → add a payment method + at least $5 credit
3. **API keys → Create new secret key** → name it `ruralcare-triage` → copy `sk-…`

## 3. Run the deploy helper

```bash
./scripts/deploy-render.sh
```

It verifies `render.yaml`, commits any pending changes, and pushes to `main`.

## 4. Create the Render Blueprint

1. Open <https://dashboard.render.com> → **New + → Blueprint**
2. Pick repo `NiLima-H/rural_health_ai`, branch `main`
3. Render reads `render.yaml` and provisions:
   - `ruralcare-db` (Postgres, starter, 90-day free)
   - `ruralcare-backend` (Docker from `backend/`, healthcheck `/health`)
   - `ruralcare-frontend` (Docker from `frontend/`, gets backend URL via
     `RENDER_EXTERNAL_URL`)
4. Wait for the backend to show **Live**.

## 5. Add the OpenAI key

In the **ruralcare-backend** service:

- **Environment → Add Environment Variable**
  - `OPENAI_API_KEY` = `sk-…`
  - `OPENAI_MODEL` = `gpt-4o-mini`
  - `WHISPER_MODEL` = `tiny` (use `small` only on the Standard plan)
- Click **Save Changes** → auto-redeploy.

## 6. Open the app

- Frontend → `https://ruralcare-frontend.onrender.com`
- API docs → `https://ruralcare-backend.onrender.com/docs`

## Free-tier caveats

- Services **spin down after 15 min of inactivity** — first request takes ~30 s.
- 512 MB RAM may OOM with `WHISPER_MODEL=small`. Stick with `tiny` for the demo.
- Postgres free plan expires after 90 days. Upgrade or export data.

## Optional: local verification first

```bash
cp .env.example .env
cp backend/.env.example backend/.env
# paste your sk-... into backend/.env
docker compose up --build
```

Frontend → `http://localhost:3010` · API → `http://localhost:8010/docs`
