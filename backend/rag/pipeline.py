"""RAG orchestration: ingest and query — single place wiring document → retrieval → LLM."""

from __future__ import annotations

import logging
import os
import uuid
from typing import Any

from chunker import chunk_text
from config import Settings
from document_loader import load_document
from embeddings.openai_provider import Embedder
from exceptions import EmptyDocumentError
from llm.openai_chat import SYSTEM_PROMPT
from llm.protocol import LLMClient
from rerank import diversify_chunks
from vector_store.base import RetrievedChunk, VectorStore

logger = logging.getLogger(__name__)


def _build_context(chunks: list[RetrievedChunk]) -> str:
    blocks: list[str] = []
    for idx, item in enumerate(chunks, start=1):
        meta = item.metadata or {}
        blocks.append(
            f"""
[근거 {idx}]
출처: {meta.get("source", "unknown")}
청크 번호: {meta.get("chunk_index", "unknown")}
내용:
{item.content}
""".strip()
        )
    return "\n\n".join(blocks)


def _build_user_prompt(question: str, context: str) -> str:
    return f"""
[질문]
{question}

[검색된 문서 근거]
{context}

위 근거에 실제로 적힌 내용만 인용해 한국어로 답변하라. 근거에 없는 문장은 쓰지 마라.
""".strip()


def _chunks_to_sources(chunks: list[RetrievedChunk]) -> list[dict[str, Any]]:
    sources: list[dict[str, Any]] = []
    for item in chunks:
        meta = item.metadata or {}
        sources.append(
            {
                "source": meta.get("source"),
                "chunk_index": meta.get("chunk_index"),
                "distance": item.distance,
                "preview": (item.content or "")[:300],
            }
        )
    return sources


class RAGPipeline:
    def __init__(
        self,
        settings: Settings,
        embedder: Embedder,
        store: VectorStore,
        llm: LLMClient,
    ) -> None:
        self._settings = settings
        self._embedder = embedder
        self._store = store
        self._llm = llm

    def vector_document_count(self) -> int:
        return self._store.count()

    def reset_vector_store(self) -> None:
        self._store.reset()

    def ingest_document(self, file_path: str) -> dict[str, int]:
        text = load_document(file_path)
        if not text.strip():
            raise EmptyDocumentError(
                "문서에서 텍스트를 추출하지 못했습니다. 스캔 PDF일 수 있습니다."
            )

        chunks = chunk_text(text, self._settings.chunk_size, self._settings.chunk_overlap)
        if not chunks:
            raise EmptyDocumentError("유효한 텍스트 청크를 만들 수 없습니다.")

        embeddings = self._embedder.embed_documents(chunks)
        filename = os.path.basename(file_path)
        ids = [str(uuid.uuid4()) for _ in chunks]
        metadatas = [{"source": filename, "chunk_index": i} for i in range(len(chunks))]

        self._store.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        logger.info("ingest_complete chunks=%d source=%s", len(chunks), filename)
        return {"chunks": len(chunks)}

    def ask_question(self, question: str, top_k: int) -> dict[str, Any]:
        if self._store.count() == 0:
            return {
                "answer": "관련 문서를 찾지 못했습니다. 먼저 교리 문서를 업로드해주세요.",
                "sources": [],
            }

        query_embedding = self._embedder.embed_query(question)
        count = self._store.count()
        pool = min(count, max(top_k, 1) * self._settings.retrieval_pool_multiplier)

        retrieved = self._store.query(query_embedding, pool)
        diversified = diversify_chunks(
            retrieved,
            top_k=max(top_k, 1),
            jaccard_threshold=self._settings.diversity_jaccard_threshold,
        )

        if not diversified:
            return {
                "answer": "검색 결과가 비어 있습니다. 다른 질문을 시도하거나 문서를 다시 업로드해주세요.",
                "sources": [],
            }

        context = _build_context(diversified)
        user_prompt = _build_user_prompt(question, context)
        answer = self._llm.generate(SYSTEM_PROMPT, user_prompt)

        return {
            "answer": answer,
            "sources": _chunks_to_sources(diversified),
        }
