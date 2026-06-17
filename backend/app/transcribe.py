from __future__ import annotations
import io
import logging
import tempfile
import os

from .config import settings

log = logging.getLogger("triage.asr")


async def transcribe_audio(data: bytes, lang: str = "en") -> str:
    """Transcribe audio bytes using faster-whisper (local) or return stub."""
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        log.warning("faster-whisper not installed — returning empty transcript")
        return ""

    model = WhisperModel(settings.whisper_model, device=settings.whisper_device, compute_type="int8")
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(data)
        path = tmp.name
    try:
        segments, _info = model.transcribe(path, language=lang if lang in ("en", "bn") else None)
        return " ".join(seg.text.strip() for seg in segments).strip()
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass
