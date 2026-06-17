import os
from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_cors(value: str | None) -> list[str]:
    if not value or value.strip() == "*":
        return ["*"]
    return [o.strip() for o in value.split(",") if o.strip()]


def _parse_seed_workers(value: str | None) -> list[dict]:
    """WORKERS env format: 'alice:password123:Nurse Alice,nurse:pass:Default Nurse'"""
    if not value:
        return [
            {"username": "nurse", "password": "nurse123", "full_name": "Default Nurse", "role": "clinician"},
            {"username": "doctor", "password": "doctor123", "full_name": "Default Doctor", "role": "doctor"},
        ]
    out: list[dict] = []
    for chunk in value.split(","):
        parts = chunk.strip().split(":")
        if len(parts) >= 2:
            out.append({
                "username": parts[0].strip(),
                "password": parts[1].strip(),
                "full_name": (parts[2].strip() if len(parts) >= 3 else parts[0].strip()),
                "role": (parts[3].strip() if len(parts) >= 4 else "clinician"),
            })
    return out


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:postgres@localhost:5432/ruralcare",
    )

    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    puku_api_key: str | None = os.getenv("PUKU_API_KEY")
    puku_base_url: str = os.getenv("PUKU_BASE_URL", "https://api.puku.dev/v1")

    whisper_model: str = os.getenv("WHISPER_MODEL", "small")
    whisper_device: str = os.getenv("WHISPER_DEVICE", "cpu")

    pdf_dir: str = os.getenv("PDF_DIR", "./pdfs")

    cors_origins: list[str] = _parse_cors(os.getenv("CORS_ORIGINS"))

    jwt_secret: str = os.getenv("JWT_SECRET", "change-me-in-production-ruralcare")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "720"))  # 12h

    seed_workers: list[dict] = _parse_seed_workers(os.getenv("WORKERS"))


settings = Settings()
