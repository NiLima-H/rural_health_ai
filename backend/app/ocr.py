from __future__ import annotations
import io
import os
import re
import logging
from typing import Iterable

from PIL import Image

log = logging.getLogger("triage.ocr")

MED_KEYWORDS = [
    "mg", "ml", "tab", "cap", "syrup", "injection", "inj",
    "paracetamol", "amoxicillin", "metformin", "insulin", "aspirin",
    "ibuprofen", "omeprazole", "cetirizine", "azithromycin",
    "salbutamol", "ors",
]


def _ocr_text(image_bytes: bytes, lang_hint: str = "eng+ben") -> str:
    try:
        import pytesseract
    except ImportError:
        log.warning("pytesseract missing — returning empty text")
        return ""

    tesseract_cmd = os.getenv("TESSERACT_CMD")
    if tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    img = Image.open(io.BytesIO(image_bytes))
    return pytesseract.image_to_string(img, lang=lang_hint)


def extract_med_entities(text: str) -> list[str]:
    found: list[str] = []
    lower = text.lower()
    for kw in MED_KEYWORDS:
        if kw in lower and kw not in found:
            found.append(kw)
    doses = re.findall(r"\b\d{2,4}\s?(mg|ml|mcg|iu)\b", lower)
    for d in doses:
        token = f"dose:{d}"
        if token not in found:
            found.append(token)
    return found


async def ocr_image(data: bytes, lang: str = "en") -> tuple[str, list[str]]:
    text = _ocr_text(data, "eng+ben" if lang in ("en", "bn") else "eng")
    entities = extract_med_entities(text)
    return text.strip(), entities
