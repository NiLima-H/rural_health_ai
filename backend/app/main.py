from __future__ import annotations
import os
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .config import settings
from .db import init_db, get_session, Patient, Encounter, Vitals as VitalsRow, Triage as TriageRow
from .schemas import (
    PatientIntake,
    TriageRequest,
    TriageResult,
    TranscribeResponse,
    OCRResponse,
    Vitals,
)
from .vitals_rules import vitals_alerts
from .ai import run_triage
from .transcribe import transcribe_audio
from .ocr import ocr_image
from .pdf import render_triage_pdf

app = FastAPI(title="RuralCare Triage API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()
    os.makedirs(settings.pdf_dir, exist_ok=True)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "version": app.version}


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    file: UploadFile = File(...),
    lang: str = Form("en"),
) -> TranscribeResponse:
    data = await file.read()
    if not data:
        raise HTTPException(400, "Empty audio upload")
    text = await transcribe_audio(data, lang=lang)
    return TranscribeResponse(text=text, language=lang)


@app.post("/ocr", response_model=OCRResponse)
async def ocr(file: UploadFile = File(...), lang: str = Form("en")) -> OCRResponse:
    data = await file.read()
    if not data:
        raise HTTPException(400, "Empty image upload")
    text, entities = await ocr_image(data, lang=lang)
    return OCRResponse(text=text, entities=entities)


@app.post("/triage", response_model=TriageResult)
async def triage(req: TriageRequest, db: Session = Depends(get_session)) -> TriageResult:
    _, warnings = vitals_alerts(req.vitals)
    result = await run_triage(req.intake, req.vitals, warnings)

    # persist
    patient = None
    if req.intake.name or req.intake.phone:
        patient = Patient(
            name=req.intake.name,
            age=req.intake.age,
            sex=req.intake.sex,
            phone=req.intake.phone,
            village=req.intake.village,
            language=req.intake.language,
            pregnancy=req.intake.pregnancy,
        )
        db.add(patient)
        db.flush()

    enc = Encounter(
        patient_id=patient.id if patient else None,
        chief_complaint=req.intake.chiefComplaintText,
        duration_days=req.intake.durationDays,
        comorbidities=req.intake.comorbidities or [],
    )
    db.add(enc)
    db.flush()

    db.add(VitalsRow(
        encounter_id=enc.id,
        heart_rate=req.vitals.heartRate,
        systolic=req.vitals.systolic,
        diastolic=req.vitals.diastolic,
        spo2=req.vitals.spo2,
        temperature_c=req.vitals.temperatureC,
        respiratory_rate=req.vitals.respiratoryRate,
        blood_glucose=req.vitals.bloodGlucose,
    ))

    tr = TriageRow(
        encounter_id=enc.id,
        severity=result.severity,
        confidence=result.confidence,
        diagnosis=[d for d in result.diagnosisSuggestions],
        first_aid=result.firstAid,
        referral=result.referral.model_dump(),
        entities=[e.model_dump() for e in result.entities],
        rationale=result.rationale,
        warnings=result.warnings,
    )
    db.add(tr)
    db.commit()

    result.encounterId = enc.id
    return result


@app.get("/report/{encounter_id}.pdf")
def report(encounter_id: str, db: Session = Depends(get_session)):
    enc = db.get(Encounter, encounter_id)
    if not enc:
        raise HTTPException(404, "Encounter not found")
    tr = db.query(TriageRow).filter_by(encounter_id=enc.id).first()
    v = enc.vitals
    intake = PatientIntake(
        name=(enc.patient.name if enc.patient else None),
        age=(enc.patient.age if enc.patient else None),
        sex=(enc.patient.sex if enc.patient else None),
        phone=(enc.patient.phone if enc.patient else None),
        village=(enc.patient.village if enc.patient else None),
        language=(enc.patient.language if enc.patient else "en") or "en",
        chiefComplaintText=enc.chief_complaint,
        durationDays=enc.duration_days,
        comorbidities=enc.comorbidities or [],
    )
    vitals = Vitals(
        heartRate=v.heart_rate, systolic=v.systolic, diastolic=v.diastolic,
        spo2=v.spo2, temperatureC=v.temperature_c, respiratoryRate=v.respiratory_rate,
        bloodGlucose=v.blood_glucose,
    )
    result = TriageResult(
        severity=tr.severity, confidence=tr.confidence,
        diagnosisSuggestions=tr.diagnosis, firstAid=tr.first_aid,
        referral=tr.referral, entities=tr.entities,
        rationale=tr.rationale, warnings=tr.warnings or [],
        generatedAt=tr.created_at.isoformat() + "Z", encounterId=enc.id,
    )
    path = os.path.join(settings.pdf_dir, f"{enc.id}.pdf")
    render_triage_pdf(path, intake, vitals, result)
    return FileResponse(path, media_type="application/pdf", filename=f"triage-{enc.id}.pdf")
