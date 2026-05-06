"""Local embeddings via SentenceTransformers (no OpenAI)."""

from __future__ import annotations

import logging
from threading import Lock
from typing import Sequence

import numpy as np
from sentence_transformers import SentenceTransformer

import config

logger = logging.getLogger(__name__)

_model: SentenceTransformer | None = None
_lock = Lock()


def _get_model() -> SentenceTransformer:
    global _model
    with _lock:
        if _model is None:
            logger.info("Loading embedding model: %s", config.EMBEDDING_MODEL_NAME)
            _model = SentenceTransformer(config.EMBEDDING_MODEL_NAME)
        return _model


def embed_texts(texts: Sequence[str], batch_size: int = 16) -> list[list[float]]:
    """문서/청크 임베딩 (passage 쪽; 프롬프트 없음)."""
    cleaned = [t.strip() for t in texts]
    if any(not t for t in cleaned):
        raise ValueError("Empty string in batch for embedding.")
    model = _get_model()
    vectors = model.encode(
        list(cleaned),
        batch_size=batch_size,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    if isinstance(vectors, np.ndarray):
        return vectors.astype(float).tolist()
    return [np.asarray(v, dtype=float).tolist() for v in vectors]


def embed_query(text: str) -> list[float]:
    """질문 임베딩. BGE-M3 등은 `prompt_name='query'` 지원 시 검색 품질에 유리."""
    t = text.strip()
    if not t:
        raise ValueError("Query is empty.")
    model = _get_model()
    kwargs = {"normalize_embeddings": True, "show_progress_bar": False}
    try:
        vectors = model.encode([t], prompt_name="query", **kwargs)
    except (TypeError, KeyError, ValueError):
        vectors = model.encode([t], **kwargs)
    if isinstance(vectors, np.ndarray):
        return vectors.astype(float).tolist()[0]
    return np.asarray(vectors[0], dtype=float).tolist()
