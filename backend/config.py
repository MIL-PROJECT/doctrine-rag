"""Centralized settings loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import List

from pathlib import Path

from dotenv import load_dotenv

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_PROJECT_ROOT / ".env")
load_dotenv()


def _split_origins(raw: str) -> List[str]:
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    return parts if parts else ["*"]


@dataclass(frozen=True)
class Settings:
    openai_api_key: str
    embedding_model: str = "text-embedding-3-small"
    chat_model: str = "gpt-4o-mini"
    openai_timeout_seconds: float = 120.0
    embedding_batch_size: int = 64
    max_upload_bytes: int = 25 * 1024 * 1024
    max_question_length: int = 4000
    chroma_dir: str = "chroma_db"
    collection_name: str = "doctrine_collection"
    chunk_size: int = 900
    chunk_overlap: int = 150
    retrieval_pool_multiplier: int = 2
    diversity_jaccard_threshold: float = 0.55
    chat_temperature: float = 0.2
    cors_origins: List[str] = field(default_factory=lambda: ["*"])
    log_level: str = "INFO"
    upload_dir: str = "uploads"

    @staticmethod
    def from_env() -> "Settings":
        key = os.getenv("OPENAI_API_KEY", "").strip()
        return Settings(
            openai_api_key=key,
            embedding_model=os.getenv("EMBEDDING_MODEL", "text-embedding-3-small").strip(),
            chat_model=os.getenv("CHAT_MODEL", "gpt-4o-mini").strip(),
            openai_timeout_seconds=float(os.getenv("OPENAI_TIMEOUT_SECONDS", "120")),
            embedding_batch_size=int(os.getenv("EMBEDDING_BATCH_SIZE", "64")),
            max_upload_bytes=int(os.getenv("MAX_UPLOAD_MB", "25")) * 1024 * 1024,
            max_question_length=int(os.getenv("MAX_QUESTION_LENGTH", "4000")),
            chroma_dir=os.getenv("CHROMA_DIR", "chroma_db").strip(),
            collection_name=os.getenv("CHROMA_COLLECTION_NAME", "doctrine_collection").strip(),
            chunk_size=int(os.getenv("CHUNK_SIZE", "900")),
            chunk_overlap=int(os.getenv("CHUNK_OVERLAP", "150")),
            retrieval_pool_multiplier=max(1, int(os.getenv("RETRIEVAL_POOL_MULTIPLIER", "2"))),
            diversity_jaccard_threshold=float(os.getenv("DIVERSITY_JACCARD_THRESHOLD", "0.55")),
            chat_temperature=float(os.getenv("CHAT_TEMPERATURE", "0.2")),
            cors_origins=_split_origins(os.getenv("CORS_ORIGINS", "*")),
            log_level=os.getenv("LOG_LEVEL", "INFO").strip().upper(),
            upload_dir=os.getenv("UPLOAD_DIR", "uploads").strip(),
        )


def validate_settings(settings: Settings) -> None:
    """Import/기동 시점에 안전한 설정만 검사 (OpenAI 키는 제외 — Docker 헬스체크용)."""
    if settings.chunk_size <= settings.chunk_overlap:
        raise RuntimeError("CHUNK_SIZE는 CHUNK_OVERLAP보다 커야 합니다.")
    if settings.max_upload_bytes <= 0:
        raise RuntimeError("MAX_UPLOAD_MB는 양수여야 합니다.")


def require_openai_api_key(settings: Settings) -> None:
    """업로드·채팅 등 OpenAI 호출 직전에 호출."""
    from exceptions import MissingOpenAIKeyError

    if not settings.openai_api_key or settings.openai_api_key == "your_openai_api_key":
        raise MissingOpenAIKeyError(
            "OPENAI_API_KEY가 설정되지 않았습니다. 프로젝트 루트 .env에 실제 키를 넣은 뒤 컨테이너를 다시 시작하세요."
        )
