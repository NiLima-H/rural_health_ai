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


async def _call_openai(messages: list[dict]) -> str | None:
    from openai import AsyncOpenAI

    try:
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        resp = await client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        return resp.choices[0].message.content or "{}"
    except Exception as e:
        log.warning("OpenAI call failed, falling back to heuristic: %s", e)
        return None


def _heuristic_triage(intake: PatientIntake, vitals: Vitals, base_warnings: list[str]) -> TriageResult:
    """Offline fallback when no AI provider is configured or LLM call fails.

    Uses a small symptom dictionary (English + Bengali) plus vital-sign rules
    to produce a usable triage recommendation. Conservative — when in doubt
    it escalates to YELLOW/RED.
    """
    from datetime import datetime

    sev: Severity = "GREEN"
    diagnosis: list[str] = ["Unspecified complaint — needs clinician review"]
    first_aid: list[str] = ["Reassure patient, monitor symptoms, encourage fluids and rest."]
    warnings: list[str] = list(base_warnings)
    conf = 0.5
    referral_level: Referral = Referral(
        level="primary_clinic",
        facility="Upazila Health Complex",
        rationale="Symptoms require clinician evaluation.",
    )

    text = (intake.chiefComplaintText or "").lower()
    bn = (intake.chiefComplaintText or "")

    # ----- RED: life-threatening patterns -----
    red_patterns = [
        ("unconscious", "অজ্ঞান", "Loss of consciousness"),
        ("not breathing", "নিঃশ্বাস বন্ধ", "Respiratory arrest"),
        ("no pulse", "নাড়ি বন্ধ", "Cardiac arrest"),
        ("severe bleeding", "অতিরিক্ত রক্তপাত", "Hemorrhagic shock"),
        ("stroke", "পক্ষাঘাত", "Suspected stroke (FAST positive)"),
        ("fits", "খিঁচুনি", "Active seizure"),
        (" seizure", "খিঁচুনি", "Active seizure"),
        ("poisoning", "বিষক্রিয়া", "Suspected poisoning"),
        ("snake bite", "সাপে কামড়", "Snake envenomation"),
    ]
    for en, bn_word, dx in red_patterns:
        if en in text or bn_word in bn:
            sev = "RED"
            diagnosis = [dx]
            first_aid = [
                "Keep airway clear, place in recovery position if unconscious.",
                "Do not give food or water.",
                "Arrange IMMEDIATE transfer to district hospital ICU.",
            ]
            referral_level = Referral(
                level="icu",
                facility="District Hospital ICU",
                rationale=f"Life-threatening pattern detected: {dx}.",
            )
            conf = 0.85
            break

    # ----- RED: chest pain suggestive of MI -----
    chest_pain = ("chest pain" in text or "বুকে ব্যথা" in bn or "বুক ব্যথা" in bn)
    red_flags = (
        ("radiat" in text or "বাম হাত" in bn)
        or ("sweating" in text or "ঘাম" in bn)
        or ("shortness of breath" in text or "শ্বাসকষ্ট" in bn)
    )
    if chest_pain and red_flags:
        sev = "RED"
        diagnosis = ["Suspected acute myocardial infarction"]
        first_aid = [
            "Sit patient upright, give 300 mg chewable aspirin if not allergic.",
            "Keep warm, reassure, do not let patient walk.",
            "Refer to district hospital immediately — call ambulance.",
        ]
        referral_level = Referral(
            level="icu",
            facility="District Hospital (cardiac care)",
            rationale="Chest pain with red-flag features suggests acute coronary syndrome.",
        )
        conf = max(conf, 0.9)

    # ----- YELLOW: urgent but not immediately life-threatening -----
    if sev == "GREEN":
        yellow_patterns = [
            ("fever", "জ্বর", "Febrile illness"),
            ("vomiting", "বমি", "Acute gastroenteritis"),
            ("diarr", "ডায়রিয়া", "Acute diarrhea"),
            ("abdominal pain", "পেটে ব্যথা", "Acute abdomen"),
            ("difficulty breathing", "শ্বাসকষ্ট", "Dyspnea"),
            ("asthma", "হাঁপানি", "Asthma exacerbation"),
            ("burn", "পোড়া", "Burn injury"),
            ("fracture", "হাড় ভাঙা", "Suspected fracture"),
            ("headache", "মাথাব্যথা", "Severe headache"),
            ("pregnant", "গর্ভবতী", "Pregnancy-related complaint"),
        ]
        for en, bn_word, dx in yellow_patterns:
            if en in text or bn_word in bn:
                sev = "YELLOW"
                diagnosis = [dx]
                first_aid = [
                    "Monitor vitals every 15 minutes.",
                    "Keep patient hydrated; give ORS if diarrhea/vomiting.",
                    "Refer to Upazila Health Complex within 4 hours.",
                ]
                referral_level = Referral(
                    level="primary_clinic",
                    facility="Upazila Health Complex",
                    rationale=f"{dx} — needs clinician review within hours.",
                )
                conf = 0.7
                break

    # ----- Vitals escalation override -----
    if any(w for w in warnings if "critical" in w or "severe" in w or "danger" in w):
        sev = "RED"
        referral_level = Referral(
            level="icu",
            facility="District Hospital",
            rationale="Critical vital sign abnormality detected.",
        )
        conf = max(conf, 0.9)

    if sev == "GREEN" and any(w for w in warnings if "warn" in w or "abnormal" in w):
        sev = "YELLOW"
        referral_level = Referral(
            level="primary_clinic",
            facility="Upazila Health Complex",
            rationale="Abnormal vitals — needs clinician review.",
        )
        conf = max(conf, 0.65)

    # ----- Pregnancy caution -----
    if intake.pregnancy and intake.pregnancy != "no" and sev == "GREEN":
        sev = "YELLOW"
        warnings.append("Pregnancy flagged — refer for obstetric review.")

    rationale = "Heuristic offline triage"
    if settings.puku_api_key or settings.openai_api_key:
        rationale += " (LLM call failed — using fallback rules)"
    else:
        rationale += " — no AI key configured. Set PUKU_API_KEY or OPENAI_API_KEY for richer reasoning."

    return TriageResult(
        severity=sev,
        confidence=conf,
        diagnosisSuggestions=diagnosis,
        firstAid=first_aid,
        referral=referral_level,
        entities=[MedicalEntity(symptom=intake.chiefComplaintText or "complaint")],
        rationale=rationale,
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
