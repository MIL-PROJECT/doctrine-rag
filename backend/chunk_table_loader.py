"""미리 잘린 청크 + 메타(CSV / JSON / JSONL) 로드."""

from __future__ import annotations

import csv
import json
import logging
import re
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# 텍스트 컬럼 후보 (앞에서부터 존재하면 사용)
_DEFAULT_TEXT_KEYS = (
    "chunk_text",
    "text",
    "content",
    "body",
    "chunk_body",
    "passage",
    "citation_text",
)


def _slug_key(key: str) -> str:
    s = str(key).strip()
    s = re.sub(r"[^\w\-]+", "_", s, flags=re.UNICODE)
    s = re.sub(r"_+", "_", s).strip("_")
    return s[:256] or "field"


def normalize_chroma_meta(raw: dict[str, Any]) -> dict[str, str | int | float | bool]:
    """Chroma 메타데이터는 str / int / float / bool 만 허용."""
    out: dict[str, str | int | float | bool] = {}
    for k, v in raw.items():
        if v is None or v == "":
            continue
        key = _slug_key(k)
        if isinstance(v, bool):
            out[key] = v
        elif isinstance(v, int) and not isinstance(v, bool):
            out[key] = v
        elif isinstance(v, float):
            out[key] = v
        elif isinstance(v, str):
            out[key] = v[:8000]
        else:
            out[key] = json.dumps(v, ensure_ascii=False)[:8000]
    return out


def _pick_text_column(row: dict[str, Any], preferred: str | None) -> str:
    if preferred and preferred in row and str(row.get(preferred, "")).strip():
        return preferred
    for k in _DEFAULT_TEXT_KEYS:
        if k in row and str(row.get(k, "")).strip():
            return k
    raise ValueError(
        f"No text column found. Tried {preferred or ''} and {_DEFAULT_TEXT_KEYS}. Keys: {list(row.keys())[:20]}"
    )


def _row_to_text_and_meta(
    row: dict[str, Any],
    text_column: str | None,
    source_hint: str,
) -> tuple[str, dict[str, Any]]:
    text_col = _pick_text_column(row, text_column)
    text = str(row[text_col]).strip()
    meta = {k: v for k, v in row.items() if k != text_col}
    meta.setdefault("source", meta.get("document_title") or meta.get("document_id") or source_hint)
    if "chunk_index" not in meta and "chunk_id" in meta:
        meta["chunk_index"] = meta["chunk_id"]
    return text, meta


def _load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line:
            continue
        rows.append(json.loads(line))
    return rows


def _load_json_array(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, list):
        raise ValueError(f"{path}: JSON root must be an array of objects.")
    return [x for x in data if isinstance(x, dict)]


def _load_csv(path: Path) -> list[dict[str, Any]]:
    text = path.read_text(encoding="utf-8-sig")
    reader = csv.DictReader(text.splitlines())
    return [dict(r) for r in reader if any((v or "").strip() for v in r.values())]


def load_chunk_file(path: Path) -> list[dict[str, Any]]:
    suf = path.suffix.lower()
    if suf == ".jsonl":
        return _load_jsonl(path)
    if suf == ".json":
        return _load_json_array(path)
    if suf == ".csv":
        return _load_csv(path)
    raise ValueError(f"Unsupported chunk file type: {path}")


def list_chunk_files(directory: Path) -> list[Path]:
    if not directory.is_dir():
        return []
    exts = {".csv", ".json", ".jsonl"}
    files = [p for p in sorted(directory.iterdir()) if p.is_file() and p.suffix.lower() in exts]
    return files


def load_all_chunk_rows(
    directory: Path,
    text_column: str | None = None,
) -> list[tuple[str, dict[str, Any], str]]:
    """
    Returns list of (text, raw_metadata_dict, provenance).
    provenance is 파일명 등 출처 표시용.
    """
    paths = list_chunk_files(directory)
    if not paths:
        return []
    out: list[tuple[str, dict[str, Any], str]] = []
    for path in paths:
        try:
            rows = load_chunk_file(path)
        except Exception:
            logger.exception("Failed to read chunk file %s", path)
            raise
        for i, row in enumerate(rows):
            if not isinstance(row, dict):
                logger.warning("Skip non-object row %s in %s", i, path.name)
                continue
            # normalize keys to str (CSV may have odd keys)
            clean_row = {str(k): v for k, v in row.items()}
            try:
                text, meta = _row_to_text_and_meta(clean_row, text_column, path.name)
            except ValueError as e:
                logger.warning("Skip row %s in %s: %s", i, path.name, e)
                continue
            if not text:
                continue
            meta["_chunk_file"] = path.name
            meta["_chunk_row"] = i
            out.append((text, meta, path.name))
    return out
