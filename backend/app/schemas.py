from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field

Severity = Literal["GREEN", "YELLOW", "RED", "BLACK"]


class Vitals(BaseModel):
    heartRate: Optional[float] = None
    systolic: Optional[float] = None
    diastolic: Optional[float] = None
    spo2: Optional[float] = None
    temperatureC: Optional[float] = None
    respiratoryRate: Optional[float] = None
    bloodGlucose: Optional[float] = None


class PatientIntake(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[Literal["male", "female", "other"]] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    language: Literal["en", "bn"] = "en"
    chiefComplaintText: Optional[str] = None
    chiefComplaintAudioUrl: Optional[str] = None
    durationDays: Optional[int] = None
    comorbidities: list[str] = Field(default_factory=list)
    pregnancy: Optional[bool] = None


class MedicalEntity(BaseModel):
    symptom: str
    duration: Optional[str] = None
    severity: Optional[str] = None


class TriageRequest(BaseModel):
    intake: PatientIntake
    vitals: Vitals = Vitals()


class Referral(BaseModel):
    level: Literal["self_care", "primary_clinic", "district_hospital", "icu"]
    facility: Optional[str] = None
    rationale: str


class TriageResult(BaseModel):
    severity: Severity
    confidence: float
    diagnosisSuggestions: list[str]
    firstAid: list[str]
    referral: Referral
    entities: list[MedicalEntity]
    rationale: str
    warnings: list[str] = Field(default_factory=list)
    generatedAt: str
    encounterId: Optional[str] = None


class TranscribeResponse(BaseModel):
    text: str
    language: str


class OCRResponse(BaseModel):
    text: str
    entities: list[str]
