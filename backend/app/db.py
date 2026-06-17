from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, create_engine
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from .config import settings

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="clinician")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    village = Column(String, nullable=True)
    language = Column(String, default="en")
    pregnancy = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Encounter(Base):
    __tablename__ = "encounters"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True)
    chief_complaint = Column(Text, nullable=True)
    duration_days = Column(Integer, nullable=True)
    comorbidities = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    vitals = relationship("Vitals", back_populates="encounter", uselist=False, cascade="all, delete-orphan")
    triage = relationship("Triage", back_populates="encounter", uselist=False, cascade="all, delete-orphan")


class Vitals(Base):
    __tablename__ = "vitals"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    encounter_id = Column(String, ForeignKey("encounters.id"))
    heart_rate = Column(Float, nullable=True)
    systolic = Column(Float, nullable=True)
    diastolic = Column(Float, nullable=True)
    spo2 = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=True)
    respiratory_rate = Column(Float, nullable=True)
    blood_glucose = Column(Float, nullable=True)
    encounter = relationship("Encounter", back_populates="vitals")


class Triage(Base):
    __tablename__ = "triage"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    encounter_id = Column(String, ForeignKey("encounters.id"))
    severity = Column(String)
    confidence = Column(Float)
    diagnosis = Column(JSON)
    first_aid = Column(JSON)
    referral = Column(JSON)
    entities = Column(JSON)
    rationale = Column(Text)
    warnings = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    encounter = relationship("Encounter", back_populates="triage")


engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    Base.metadata.create_all(engine)


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
