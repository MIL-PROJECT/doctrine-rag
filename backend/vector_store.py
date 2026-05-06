"""ChromaDB vector store — cosine space, precomputed embeddings."""

from __future__ import annotations

import logging
import uuid
from pathlib import Path
from typing import Any

import chromadb

import config

logger = logging.getLogger(__name__)

_client = chromadb.PersistentClient(path=str(config.CHROMA_DIR))
_collection = _client.get_or_create_collection(
    name=config.COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"},
)


def collection_count() -> int:
    return _collection.count()


def collection_stats() -> dict[str, Any]:
    """헬스/모니터링용 — 컬렉션명·문서 수·설정상 Chroma 경로 표시."""
    return {
        "collection": config.COLLECTION_NAME,
        "documents": collection_count(),
        "path": config.CHROMA_PATH_DISPLAY,
    }


def add_chunks(
    chunks: list[str],
    embeddings: list[list[float]],
    source_name: str,
    start_index: int = 0,
) -> int:
    if not chunks:
        return 0
    if len(chunks) != len(embeddings):
        raise ValueError("chunks and embeddings length mismatch.")

    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas: list[dict[str, Any]] = [
        {"source": source_name, "chunk_index": start_index + i}
        for i in range(len(chunks))
    ]
    _collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    return len(chunks)


def add_chunk_records(
    documents: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict[str, Any]],
    ids: list[str] | None = None,
) -> int:
    """행마다 다른 메타데이터를 가진 청크 일괄 추가."""
    if not documents:
        return 0
    if len(documents) != len(embeddings) or len(documents) != len(metadatas):
        raise ValueError("documents, embeddings, metadatas length mismatch.")
    id_list = ids if ids is not None and len(ids) == len(documents) else [str(uuid.uuid4()) for _ in documents]
    _collection.add(
        ids=id_list,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    return len(documents)


def search(question_embedding: list[float], top_k: int) -> list[dict[str, Any]]:
    n = collection_count()
    if n == 0:
        return []
    k = min(max(top_k, 1), n)
    res = _collection.query(
        query_embeddings=[question_embedding],
        n_results=k,
    )
    docs = res.get("documents", [[]])[0]
    metas = res.get("metadatas", [[]])[0]
    dists = res.get("distances", [[]])[0]

    out: list[dict[str, Any]] = []
    for i, content in enumerate(docs):
        meta = metas[i] if i < len(metas) else {}
        dist = dists[i] if i < len(dists) else None
        out.append(
            {
                "content": content or "",
                "metadata": dict(meta) if meta else {},
                "distance": float(dist) if dist is not None else None,
            }
        )
    return out


def reset_collection() -> None:
    global _collection
    try:
        _client.delete_collection(config.COLLECTION_NAME)
    except Exception:
        logger.warning("delete_collection failed or missing", exc_info=True)
    _collection = _client.get_or_create_collection(
        name=config.COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def remove_ingest_flag() -> None:
    p = Path(config.INGEST_FLAG_PATH)
    if p.exists():
        p.unlink()
