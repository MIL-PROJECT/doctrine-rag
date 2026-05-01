"""Upload and input validation."""

from __future__ import annotations

import os
from pathlib import Path

from exceptions import BadInputError


ALLOWED_EXTENSIONS = {".pdf", ".txt"}
PDF_MAGIC = b"%PDF"


def assert_allowed_extension(filename: str) -> str:
    ext = Path(filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise BadInputError("PDF 또는 TXT 파일만 업로드 가능합니다.")
    return ext


def assert_file_size(num_bytes: int, max_bytes: int) -> None:
    if num_bytes > max_bytes:
        mb = max_bytes // (1024 * 1024)
        raise BadInputError(f"파일 크기는 {mb}MB를 초과할 수 없습니다.")


def validate_pdf_magic(file_path: str) -> None:
    """Reject non-PDF files renamed with .pdf (best-effort)."""
    ext = Path(file_path).suffix.lower()
    if ext != ".pdf":
        return
    with open(file_path, "rb") as f:
        head = f.read(5)
    if not head.startswith(PDF_MAGIC):
        raise BadInputError("유효한 PDF 파일이 아닙니다.")


def safe_filename(filename: str) -> str:
    base = os.path.basename(filename or "upload")
    if not base or base in (".", ".."):
        raise BadInputError("유효하지 않은 파일 이름입니다.")
    return base


def assert_question(question: str, max_length: int) -> str:
    q = question.strip()
    if not q:
        raise BadInputError("질문을 입력해주세요.")
    if len(q) > max_length:
        raise BadInputError(f"질문은 {max_length}자 이하여야 합니다.")
    return q


def assert_top_k(top_k: int, cap: int = 20) -> int:
    if top_k < 1:
        raise BadInputError("top_k는 1 이상이어야 합니다.")
    if top_k > cap:
        raise BadInputError(f"top_k는 {cap} 이하여야 합니다.")
    return top_k
