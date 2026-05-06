def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150) -> list[str]:
    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap.")

    normalized = (
        text.replace("\r\n", "\n")
        .replace("\r", "\n")
        .replace("\n\n\n", "\n\n")
        .strip()
    )

    paragraphs = [p.strip() for p in normalized.split("\n\n") if p.strip()]
    if not paragraphs:
        return []

    units: list[str] = []
    buf = ""
    for p in paragraphs:
        if not buf:
            buf = p
        elif len(buf) + 2 + len(p) <= chunk_size:
            buf = f"{buf}\n\n{p}"
        else:
            units.append(buf)
            buf = p
    if buf:
        units.append(buf)

    chunks: list[str] = []
    for unit in units:
        chunks.extend(_window_slice(unit, chunk_size, overlap))
    return [c for c in chunks if c.strip()]


def _window_slice(text: str, chunk_size: int, overlap: int) -> list[str]:
    if len(text) <= chunk_size:
        return [text.strip()] if text.strip() else []
    out: list[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        piece = text[start:end].strip()
        if piece:
            out.append(piece)
        start += chunk_size - overlap
    return out
