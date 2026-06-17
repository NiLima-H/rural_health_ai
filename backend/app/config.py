import os
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    cors_origins: list[str] = ["*"]


settings = Settings()
