import os
from pathlib import Path

from pypdf import PdfReader


def load_document(file_path: str) -> str:
    ext = Path(file_path).suffix.lower()

    if ext == ".txt":
        for encoding in ("utf-8-sig", "utf-8", "cp949"):
            try:
                with open(file_path, "r", encoding=encoding) as f:
                    return f.read()
            except UnicodeDecodeError:
                continue
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()

    if ext == ".pdf":
        reader = PdfReader(file_path)
        pages: list[str] = []
        for page_number, page in enumerate(reader.pages, start=1):
            text = page.extract_text()
            if text and text.strip():
                pages.append(f"\n[PAGE {page_number}]\n{text}")
        return "\n".join(pages)

    raise ValueError(f"Unsupported extension: {ext}")


def list_doctrine_files(directory: str | os.PathLike[str]) -> list[Path]:
    root = Path(directory)
    if not root.is_dir():
        return []
    out: list[Path] = []
    for p in sorted(root.iterdir()):
        if p.is_file() and p.suffix.lower() in (".pdf", ".txt"):
            out.append(p)
    return out
