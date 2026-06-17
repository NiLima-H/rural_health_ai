from __future__ import annotations
import json
import logging
from typing import Any

import httpx

from .config import settings
from .schemas import (
    PatientIntake,
    TriageResult,
    Vitals,
    Severity,
    MedicalEntity,
    Referral,
)

log = logging.getLogger("triage.ai")

SYSTEM_PROMPT = """You are a conservative, safety-first medical triage assistant for rural clinics.
You NEVER replace a doctor. You suggest likely diagnoses, immediate first aid, and the appropriate level of care.
Always respond in the same language the patient used (English or Bengali/Bangla).
Use these triage severity levels:
  GREEN  — routine / self-care
  YELLOW — urgent, see a clinician within hours
  RED    — emergency, refer to hospital immediately
  BLACK  — expectant / deceased (used only when signs of death are obvious)

Return STRICT JSON with this exact schema:
{
  "severity": "GREEN" | "YELLOW" | "RED" | "BLACK",
  "confidence": 0.0..1.0,
  "diagnosisSuggestions": ["..."],
  "firstAid": ["..."],
  "referral": { "level": "self_care"|"primary_clinic"|"district_hospital"|"icu", "facility": "...", "rationale": "..." },
  "entities": [ { "symptom": "...", "duration": "...", "severity": "..." } ],
  "rationale": "one short paragraph in patient's language",
  "warnings": ["..."]
}
Do not include any prose outside the JSON."""


async def _call_puku(messages: list[dict]) -> str | None:
    if not settings.puku_api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{settings.puku_base_url}/chat/completions",
                headers={"Authorization": f"Bearer {settings.puku_api_key}"},
                json={
                    "model": "puku-ai-2.7",
                    "messages": messages,
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"},
                },
            )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        log.warning("Puku AI call failed, falling back: %s", e)
        return None


async def _call_openai(messages: list[dict]) -> str:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    return resp.choices[0].message.content or "{}"


def _heuristic_triage(intake: PatientIntake, vitals: Vitals, base_warnings: list[str]) -> TriageResult:
    """Offline fallback when no AI provider is configured."""
    from datetime import datetime

    sev: Severity = "GREEN"
    diagnosis = ["Unspecified complaint — needs clinician review"]
    first_aid = ["Reassure patient, monitor symptoms, encourage fluids and rest."]
    warnings = list(base_warnings)
    conf = 0.5
    referral_level: Referral = Referral(
        level="primary_clinic", facility="Upazila Health Complex",
        rationale="Symptoms require clinician evaluation."
    )

    text = (intake.chiefComplaintText or "").lower()
    if "অজ্ঞান" in text or "unconscious" in text or "নিঃশ্বাস বন্ধ" in text or "not breathing" in text:
        sev = "RED"
        diagnosis = ["Loss of consciousness / respiratory arrest"]
        first_aid = ["Place in recovery position, clear airway, prepare referral NOW."]
        referral_level = Referral(level="icu", rationale="Life-threatening signs.")
        conf = 0.9

    if any(w for w in warnings if "critical" in w or "severe" in w):
        sev = "RED"
        referral_level = Referral(level="icu", rationale="Critical vital sign abnormality.")
        conf = max(conf, 0.85)

    return TriageResult(
        severity=sev,
        confidence=conf,
        diagnosisSuggestions=diagnosis,
        firstAid=first_aid,
        referral=referral_level,
        entities=[MedicalEntity(symptom=intake.chiefComplaintText or "complaint")],
        rationale="Heuristic offline triage — enable Puku AI / OpenAI for higher accuracy.",
        warnings=warnings,
        generatedAt=datetime.utcnow().isoformat() + "Z",
    )


async def run_triage(intake: PatientIntake, vitals: Vitals, base_warnings: list[str]) -> TriageResult:
    from datetime import datetime

    payload = {
        "intake": intake.model_dump(),
        "vitals": vitals.model_dump(),
        "vital_alerts": base_warnings,
        "language": intake.language,
    }
    user_msg = {
        "role": "user",
        "content": (
            "Triage this patient. Return strict JSON only.\n\n"
            f"DATA:\n{json.dumps(payload, ensure_ascii=False, indent=2)}"
        ),
    }
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        user_msg,
    ]

    raw: str | None = None
    if settings.puku_api_key:
        raw = await _call_puku(messages)
    if raw is None and settings.openai_api_key:
        raw = await _call_openai(messages)

    if raw is None:
        result = _heuristic_triage(intake, vitals, base_warnings)
        result.warnings = list(base_warnings) + result.warnings
        return result

    try:
        data: dict[str, Any] = json.loads(raw)
    except json.JSONDecodeError:
        log.warning("AI returned non-JSON, using heuristic: %s", raw[:200])
        return _heuristic_triage(intake, vitals, base_warnings)

    return TriageResult(
        severity=data.get("severity", "GREEN"),
        confidence=float(data.get("confidence", 0.6)),
        diagnosisSuggestions=data.get("diagnosisSuggestions", []),
        firstAid=data.get("firstAid", []),
        referral=Referral(**data.get("referral", {"level": "primary_clinic", "rationale": ""})),
        entities=[MedicalEntity(**e) for e in data.get("entities", []) if isinstance(e, dict)],
        rationale=data.get("rationale", ""),
        warnings=list(dict.fromkeys((data.get("warnings") or []) + base_warnings)),
        generatedAt=datetime.utcnow().isoformat() + "Z",
    )
