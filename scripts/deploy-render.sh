#!/usr/bin/env bash
# deploy-render.sh
# One-shot deploy helper for the Render Blueprint path.
#
# Prereqs:
#   - repo pushed to GitHub (already done: NiLima-H/rural_health_ai)
#   - Render account: https://dashboard.render.com
#   - OpenAI API key with billing set up: https://platform.openai.com/api-keys
#
# This script only automates the git side. The Render side is a one-time
# click in the dashboard, then everything auto-provisions via render.yaml.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Verifying render.yaml exists"
test -f render.yaml || { echo "render.yaml missing"; exit 1; }

echo "==> Checking git status"
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not a git repo. Run: git init && git remote add origin <url>"
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "==> Current branch: $BRANCH"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "==> Uncommitted changes — committing"
  git add -A
  git commit -m "chore: deploy prep ($(date +%Y-%m-%d))" || true
fi

echo "==> Pushing to origin/$BRANCH"
git push origin "$BRANCH"

cat <<'NEXT'

✅ Code is on GitHub. Now finish the deploy in Render:

1. Open  https://dashboard.render.com  →  New +  →  Blueprint
2. Pick repo  NiLima-H/rural_health_ai  , branch  main
3. Render reads render.yaml and provisions:
     - ruralcare-db       (Postgres, starter plan, 90-day free)
     - ruralcare-backend  (Docker from backend/, /health check)
     - ruralcare-frontend (Docker from frontend/, gets backend URL)
4. Wait for backend service to show "Live".
5. Open backend service  →  Environment  →  Add:
     OPENAI_API_KEY  =  sk-...your real key...
     OPENAI_MODEL    =  gpt-4o-mini
     WHISPER_MODEL   =  tiny          (use 'small' on Standard plan)
6. Click  Save Changes  →  backend auto-redeploys (~2 min).
7. Open the  ruralcare-frontend.onrender.com  URL in your browser.

Free-tier notes:
  • Services sleep after 15 min idle. First request takes ~30 s.
  • 512 MB RAM may OOM with WHISPER_MODEL=small. Use 'tiny' for the demo.
  • Postgres free plan expires after 90 days. Upgrade or export data.

After deploy, your live URLs will be:
  Frontend:  https://ruralcare-frontend.onrender.com
  Backend:   https://ruralcare-backend.onrender.com
  API docs:  https://ruralcare-backend.onrender.com/docs

NEXT
