#!/usr/bin/env bash
# Deploy backend/ to a Hugging Face Space (Docker SDK, free, no card).
# Usage: HF_TOKEN=hf_xxx HF_SPACE=NiLima-H/ruralcare-api ./scripts/deploy-hf.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap "rm -rf $TMP" EXIT

: "${HF_TOKEN:?Set HF_TOKEN (hf_...) — get one at https://huggingface.co/settings/tokens}"
: "${HF_SPACE:?Set HF_SPACE like 'NiLima-H/ruralcare-api'}"

USER="${HF_SPACE%%/*}"
SPACE="${HF_SPACE##*/}"

echo "→ Mirroring backend/ into $TMP"
cd "$REPO_ROOT/backend"
tar --exclude=__pycache__ --exclude=.puku --exclude=pdfs --exclude='*.pyc' \
    -cf - . | (cd "$TMP" && tar -xf -)

# Use HF-specific Dockerfile
cp "$REPO_ROOT/backend/Dockerfile.hf" "$TMP/Dockerfile"

cd "$TMP"
git init -q
git checkout -q -b main
git config user.name "RuralCare Deploy"
git config user.email "deploy@local"
git add -A
git commit -q -m "Deploy RuralCare backend to HF Space"
git remote add origin "https://oauth2:${HF_TOKEN}@huggingface.co/spaces/${USER}/${SPACE}.git"

echo "→ Pushing to https://huggingface.co/spaces/${USER}/${SPACE}"
git push -f origin main 2>&1 | tail -20

echo ""
echo "✅ Deployed. Watch build at https://huggingface.co/spaces/${USER}/${SPACE}"
echo "   Once 'Running', your API is at https://${USER}-${SPACE}.hf.space"
