"""Lightweight retrieval refinement without extra model calls (diversity / redundancy reduction)."""

from __future__ import annotations

from vector_store.base import RetrievedChunk


def _token_jaccard(a: str, b: str) -> float:
    ta = set(a.lower().split())
    tb = set(b.lower().split())
    if not ta or not tb:
        return 0.0
    inter = len(ta & tb)
    union = len(ta | tb)
    return inter / union if union else 0.0


def diversify_chunks(
    ranked: list[RetrievedChunk],
    top_k: int,
    jaccard_threshold: float,
) -> list[RetrievedChunk]:
    """
    Greedy selection: keep retrieval order but skip chunks too similar to already chosen ones.
    Fills remaining slots with the next best items if the pool is exhausted.
    """
    if not ranked or top_k <= 0:
        return []

    selected: list[RetrievedChunk] = []
    skipped: list[RetrievedChunk] = []

    for chunk in ranked:
        if len(selected) >= top_k:
            break
        if not chunk.content.strip():
            continue
        if all(
            _token_jaccard(chunk.content, s.content) < jaccard_threshold for s in selected
        ):
            selected.append(chunk)
        else:
            skipped.append(chunk)

    for chunk in skipped:
        if len(selected) >= top_k:
            break
        if chunk not in selected:
            selected.append(chunk)

    return selected[:top_k]
