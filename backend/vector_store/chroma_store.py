"""ChromaDB implementation of VectorStore (persistent, embedded)."""

from __future__ import annotations

import logging
from typing import Any

import chromadb

from config import Settings
from vector_store.base import RetrievedChunk, VectorStore

logger = logging.getLogger(__name__)


class ChromaVectorStore(VectorStore):
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = chromadb.PersistentClient(path=settings.chroma_dir)
        self._collection = self._client.get_or_create_collection(name=settings.collection_name)

    def count(self) -> int:
        return self._collection.count()

    def add(
        self,
        *,
        ids: list[str],
        documents: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict[str, Any]],
    ) -> None:
        if not ids:
            return
        self._collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )

    def query(self, query_embedding: list[float], n_results: int) -> list[RetrievedChunk]:
        if self.count() == 0:
            return []

        n = min(max(n_results, 1), self.count())
        results = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=n,
        )

        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        out: list[RetrievedChunk] = []
        for i, content in enumerate(docs):
            meta = metas[i] if i < len(metas) else {}
            dist = distances[i] if i < len(distances) else None
            out.append(
                RetrievedChunk(
                    content=content or "",
                    metadata=dict(meta) if meta else {},
                    distance=float(dist) if dist is not None else None,
                )
            )
        return out

    def reset(self) -> None:
        try:
            self._client.delete_collection(self._settings.collection_name)
        except Exception:
            logger.warning("Collection delete skipped or failed", exc_info=True)
        self._collection = self._client.get_or_create_collection(name=self._settings.collection_name)
