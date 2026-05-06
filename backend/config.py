"""Configuration — Ollama + local embeddings only (no OpenAI)."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

_BACKEND_ROOT = Path(__file__).resolve().parent
_PROJECT_ROOT = _BACKEND_ROOT.parent

load_dotenv(_PROJECT_ROOT / ".env")
load_dotenv()

# 디스크 경로(영구 저장). env 값은 상대 경로면 backend 기준으로 해석됩니다.
_CHROMA_ENV = os.getenv("CHROMA_DIR", "chroma_db").strip() or "chroma_db"
CHROMA_PATH_DISPLAY = _CHROMA_ENV
CHROMA_DIR = (_BACKEND_ROOT / _CHROMA_ENV).resolve()
COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "doctrine_ollama")
DOCTRINE_DATA_DIR = _BACKEND_ROOT / os.getenv("DOCTRINE_DATA_DIR", "data/doctrine")
# 구조화 청크(CSV/JSON/JSONL) 디렉터리 — INGEST_MODE=chunks 일 때 사용
CHUNKS_DATA_DIR = _BACKEND_ROOT / os.getenv("CHUNKS_DATA_DIR", "data/chunks")
# doctrine: PDF/TXT 자동 청킹 | chunks: CHUNKS_DATA_DIR 만 사용
_m = os.getenv("INGEST_MODE", "doctrine").strip().lower()
INGEST_MODE = _m if _m in ("doctrine", "chunks") else "doctrine"
# 비어 있으면 chunk_text, text, content … 순으로 텍스트 컬럼 자동 탐지
CHUNK_TEXT_COLUMN = os.getenv("CHUNK_TEXT_COLUMN", "").strip() or None

INGEST_FLAG_PATH = CHROMA_DIR / ".ingested"

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
OLLAMA_TIMEOUT_SECONDS = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "300"))

# BGE-M3 (1024-dim). 모델을 바꾼 뒤에는 기존 Chroma 벡터 차원과 맞지 않으므로 /reset 또는 chroma_db 삭제 후 재인제스트 필요.
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "900"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "150"))
TOP_K_MAX = int(os.getenv("TOP_K_MAX", "20"))

CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "*").split(",")
    if o.strip()
] or ["*"]

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
