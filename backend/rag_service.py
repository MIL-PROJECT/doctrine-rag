"""RAG orchestration: ingest doctrine corpus + answer questions."""

from __future__ import annotations

import logging
from pathlib import Path

import config
from chunk_table_loader import load_all_chunk_rows, normalize_chroma_meta
from embeddings import embed_query, embed_texts
from ingest_seed import ensure_ingested, ingest_doctrine_unified
from llm import generate_answer
import vector_store

logger = logging.getLogger(__name__)


def _ensure_dirs() -> None:
    config.CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    config.DOCTRINE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    config.CHUNKS_DATA_DIR.mkdir(parents=True, exist_ok=True)


def ingest_structured_chunks(directory: str | Path | None = None) -> dict:
    """
    CSV / JSON / JSONL 행을 그대로 청크로 임베딩·저장 (재청킹 없음).
    텍스트 컬럼: CHUNK_TEXT_COLUMN 또는 chunk_text, text, content … 자동 탐지.
    """
    _ensure_dirs()
    root = Path(directory) if directory else config.CHUNKS_DATA_DIR
    rows = load_all_chunk_rows(root, config.CHUNK_TEXT_COLUMN)
    if not rows:
        logger.warning("No chunk rows in %s (expected .csv, .json, .jsonl)", root)
        return {"chunks": 0, "files": []}

    texts = [t for t, _, _ in rows]
    metas_chroma = [normalize_chroma_meta(m) for _, m, _ in rows]
    embeddings = embed_texts(texts)
    n = vector_store.add_chunk_records(texts, embeddings, metas_chroma)
    files = sorted({f for _, _, f in rows})
    logger.info("Ingested %s structured chunks from %s file(s)", n, len(files))
    return {"chunks": n, "files": files, "mode": "chunks"}


def ingest_corpus() -> dict:
    """INGEST_MODE 에 따라 doctrine(.csv/.pdf/.txt) 또는 구조화 청크만 인제스트."""
    if config.INGEST_MODE == "chunks":
        return ingest_structured_chunks()
    return ingest_doctrine_unified()


def run_startup_ingest() -> None:
    """Chroma 문서 수·플래그에 따라 idempotent 인제스트 (ingest_seed 와 동일 규칙)."""
    ensure_ingested()


def build_context(chunks: list[dict]) -> str:
    blocks: list[str] = []
    for idx, item in enumerate(chunks, start=1):
        meta = item.get("metadata") or {}
        title = meta.get("document_title") or meta.get("document_short_title") or ""
        chapter = meta.get("chapter", "")
        section = meta.get("section", "")
        page = meta.get("pdf_page_start") or meta.get("page") or meta.get("pdf_page_end") or ""

        cite_bits = [f"Source: {meta.get('source', 'unknown')}"]
        if title:
            cite_bits.append(f"Document: {title}")
        if chapter:
            cite_bits.append(f"Chapter: {chapter}")
        if section:
            cite_bits.append(f"Section: {section}")
        if page not in ("", None):
            cite_bits.append(f"Page: {page}")

        blocks.append(
            f"""
[Evidence {idx}]
{", ".join(cite_bits)}
Chunk index: {meta.get("chunk_index", "unknown")}
Text:
{item.get("content", "")}
""".strip()
        )
    return "\n\n".join(blocks)


def ask_question(question: str, top_k: int = 5) -> dict:
    q = question.strip()
    if not q:
        raise ValueError("Question is empty.")

    if vector_store.collection_count() == 0:
        if config.INGEST_MODE == "chunks":
            hint = (
                f"No documents are indexed yet. Add chunk files (.csv, .json, .jsonl) to {config.CHUNKS_DATA_DIR} "
                "and restart the backend (or DELETE /reset)."
            )
        else:
            hint = (
                "No documents are indexed yet. Place CSV/PDF/TXT files in data/doctrine and restart the backend."
            )
        return {"answer": hint, "sources": []}

    q_emb = embed_query(q)
    retrieved = vector_store.search(q_emb, top_k=top_k)
    if not retrieved:
        return {"answer": "No relevant passages were retrieved.", "sources": []}

    context = build_context(retrieved)
    answer = generate_answer(q, context)

    sources: list[dict] = []
    extra_keys = (
        "document_title",
        "document_short_title",
        "document_id",
        "chapter",
        "section",
        "subsection",
        "pdf_page_start",
        "pdf_page_end",
        "chunk_id",
    )
    for item in retrieved:
        meta = item.get("metadata") or {}
        row: dict = {
            "source": meta.get("source"),
            "chunk_index": meta.get("chunk_index"),
            "distance": item.get("distance"),
            "preview": (item.get("content") or "")[:300],
        }
        for k in extra_keys:
            if meta.get(k) is not None and meta.get(k) != "":
                row[k] = meta.get(k)
        sources.append(row)

    return {"answer": answer, "sources": sources}


def full_reset_and_reingest() -> dict:
    """DELETE /reset: clear Chroma, remove flag, re-ingest."""
    vector_store.reset_collection()
    vector_store.remove_ingest_flag()
    result = ingest_corpus()
    if result["chunks"] > 0:
        Path(config.INGEST_FLAG_PATH).touch()
    return {"message": "Vector store reset and re-ingested.", **result}
