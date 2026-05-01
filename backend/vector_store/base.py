"""Vector store port — Chroma today, Qdrant/PGVector tomorrow."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol, runtime_checkable


@dataclass
class RetrievedChunk:
    content: str
    metadata: dict[str, Any]
    distance: float | None


@runtime_checkable
class VectorStore(Protocol):
    def count(self) -> int: ...

    def add(
        self,
        *,
        ids: list[str],
        documents: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict[str, Any]],
    ) -> None: ...

    def query(self, query_embedding: list[float], n_results: int) -> list[RetrievedChunk]: ...

    def reset(self) -> None: ...
