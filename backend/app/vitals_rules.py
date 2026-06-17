from __future__ import annotations
from .schemas import Vitals, Severity


def _flag(field: str, level: str, message: str):
    return {"field": field, "level": level, "message": message}


def vitals_alerts(v: Vitals) -> tuple[list[dict], list[str]]:
    """Return (alerts, warnings) for vitals."""
    alerts: list[dict] = []
    warnings: list[str] = []

    if v.heartRate is not None:
        if v.heartRate < 40 or v.heartRate > 140:
            alerts.append(_flag("heartRate", "danger", f"Heart rate {v.heartRate} bpm critical"))
            warnings.append("Bradycardia/tachycardia — check perfusion, rhythm.")
        elif not (60 <= v.heartRate <= 110):
            alerts.append(_flag("heartRate", "warn", "HR outside normal range"))

    if v.systolic is not None and v.diastolic is not None:
        if v.systolic >= 180 or v.diastolic >= 120 or v.systolic < 80:
            alerts.append(_flag("bp", "danger", f"BP {v.systolic}/{v.diastolic} critical"))
            warnings.append("Hypertensive crisis or shock suspected.")

    if v.spo2 is not None:
        if v.spo2 < 90:
            alerts.append(_flag("spo2", "danger", f"SpO₂ {v.spo2}% — severe hypoxemia"))
            warnings.append("Give oxygen immediately, prepare referral.")
        elif v.spo2 < 94:
            alerts.append(_flag("spo2", "warn", "Mild hypoxemia"))

    if v.temperatureC is not None:
        if v.temperatureC >= 40 or v.temperatureC <= 35:
            alerts.append(_flag("temp", "danger", f"Temperature {v.temperatureC}°C critical"))
            warnings.append("Hyper/hypothermia — consider sepsis work-up.")
        elif v.temperatureC >= 38:
            alerts.append(_flag("temp", "warn", "Fever"))

    if v.respiratoryRate is not None:
        if v.respiratoryRate < 8 or v.respiratoryRate > 30:
            alerts.append(_flag("rr", "danger", f"Respiratory rate {v.respiratoryRate} critical"))
            warnings.append("Abnormal respiratory pattern.")

    if v.bloodGlucose is not None and (v.bloodGlucose < 60 or v.bloodGlucose > 300):
        alerts.append(_flag("glucose", "danger", f"Glucose {v.bloodGlucose} mg/dL critical"))
        warnings.append("Hypo/hyperglycemia — give oral/IV glucose as appropriate.")

    return alerts, warnings


def worst_severity(alerts: list[dict]) -> Severity | None:
    if any(a["level"] == "danger" for a in alerts):
        return "RED"
    if any(a["level"] == "warn" for a in alerts):
        return "YELLOW"
    return None
