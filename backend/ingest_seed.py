"""
시작 시 Chroma 상태를 보고 시드 인제스트를 한 번만 수행합니다.

- 컬렉션에 문서가 있으면 인제스트를 건너뜁니다(재시작 시 중복 방지).
- 문서 수가 0이면 `.ingested` 가 있어도 제거한 뒤 다시 인제스트합니다.
- INGEST_MODE=chunks 이면 data/chunks 의 구조화 청크만, doctrine 이면
  data/doctrine 의 .csv / .pdf / .txt 를 처리합니다.

Docker / 로컬 공통:
  python ingest_seed.py
"""

from __future__ import annotations

import csv
import logging
import sys
from pathlib import Path

import config
from chunk_table_loader import normalize_chroma_meta
from chunker import chunk_text
from document_loader import load_document
from embeddings import embed_texts
import vector_store

logging.basicConfig(level=getattr(logging, config.LOG_LEVEL, logging.INFO))
logger = logging.getLogger(__name__)


def _ensure_dirs() -> None:
    config.CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    config.DOCTRINE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    config.CHUNKS_DATA_DIR.mkdir(parents=True, exist_ok=True)


def _list_doctrine_corpus_files(root: Path) -> list[Path]:
    if not root.is_dir():
        return []
    csvs = sorted(p for p in root.iterdir() if p.is_file() and p.suffix.lower() == ".csv")
    docs = sorted(p for p in root.iterdir() if p.is_file() and p.suffix.lower() in (".pdf", ".txt"))
    return csvs + docs


def _ingest_csv_file(path: Path) -> int:
    texts: list[str] = []
    metas: list[dict[str, object]] = []
    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            logger.warning("CSV has no header row: %s", path.name)
            return 0
        for row in reader:
            raw = {str(k).strip(): v for k, v in row.items() if k is not None}
            text = (
                str(raw.get("embedding_text") or raw.get("chunk_text") or raw.get("content") or "").strip()
            )
            if not text:
                continue
            meta_raw: dict[str, object] = {
                k: v for k, v in raw.items() if k not in ("embedding_text", "chunk_text", "content")
            }
            meta_raw.setdefault("source", path.name)
            texts.append(text)
            metas.append(normalize_chroma_meta(meta_raw))
    if not texts:
        logger.warning("No non-empty rows in %s", path.name)
        return 0
    embeddings = embed_texts(texts)
    return vector_store.add_chunk_records(texts, embeddings, metas)


def _ingest_pdf_or_txt(path: Path) -> int:
    try:
        text = load_document(str(path))
    except Exception as e:
        logger.exception("Failed to load %s", path)
        raise RuntimeError(f"Failed to load {path.name}: {e}") from e
    if not text.strip():
        logger.warning("Skipping empty extract: %s", path.name)
        return 0
    chunks = chunk_text(text, config.CHUNK_SIZE, config.CHUNK_OVERLAP)
    if not chunks:
        return 0
    embeddings = embed_texts(chunks)
    return vector_store.add_chunks(
        chunks,
        embeddings,
        source_name=path.name,
        start_index=0,
    )


def ingest_doctrine_unified(directory: str | Path | None = None) -> dict:
    """
    data/doctrine 내 .csv(행 단위) + .pdf/.txt(청킹) 인제스트.
    """
    _ensure_dirs()
    root = Path(directory) if directory else config.DOCTRINE_DATA_DIR
    paths = _list_doctrine_corpus_files(root)
    if not paths:
        logger.warning("No .csv/.pdf/.txt in %s", root)
        return {"chunks": 0, "files": [], "mode": "doctrine"}

    total = 0
    seen: list[str] = []
    for path in paths:
        suf = path.suffix.lower()
        if suf == ".csv":
            n = _ingest_csv_file(path)
        elif suf in (".pdf", ".txt"):
            n = _ingest_pdf_or_txt(path)
        else:
            continue
        total += n
        seen.append(path.name)
    logger.info("Doctrine ingest: %s chunks from %s file(s)", total, len(seen))
    return {"chunks": total, "files": seen, "mode": "doctrine"}


def _run_mode_ingest() -> dict:
    if config.INGEST_MODE == "chunks":
        from rag_service import ingest_structured_chunks

        return ingest_structured_chunks()
    return ingest_doctrine_unified()


def ensure_ingested() -> None:
    """
    컬렉션에 문서가 있으면 인제스트 생략(플래그만 복구 가능).
    비어 있으면 모드에 맞게 인제스트 후 `.ingested` 생성.
    """
    _ensure_dirs()
    flag = Path(config.INGEST_FLAG_PATH)
    count = vector_store.collection_count()

    if count > 0:
        if not flag.exists():
            flag.touch()
            logger.info("Chroma has %s documents; recreated missing flag %s", count, flag)
        else:
            logger.info("Chroma has %s documents and flag exists; skipping ingest.", count)
        return

    if flag.exists():
        flag.unlink()
        logger.info("Removed stale ingest flag (collection empty).")

    result = _run_mode_ingest()
    if result["chunks"] > 0:
        flag.touch()
        logger.info("Ingest complete: %s chunks (mode=%s)", result["chunks"], result.get("mode"))
    else:
        if config.INGEST_MODE == "chunks":
            logger.warning(
                "Ingest produced 0 chunks. Add .csv/.json/.jsonl to %s and restart (or DELETE /reset).",
                config.CHUNKS_DATA_DIR,
            )
        else:
            logger.warning(
                "Ingest produced 0 chunks. Add .csv/.pdf/.txt to %s and restart (or DELETE /reset).",
                config.DOCTRINE_DATA_DIR,
            )


def main() -> int:
    try:
        ensure_ingested()
    except Exception:
        logger.exception("ingest_seed failed")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
