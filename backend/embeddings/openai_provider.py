"""OpenAI embedding provider with batching and timeouts."""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from openai import APIError, APITimeoutError, OpenAI, RateLimitError

from config import Settings
from exceptions import UpstreamError
from openai_err import raise_for_openai


@runtime_checkable
class Embedder(Protocol):
    def embed_query(self, text: str) -> list[float]: ...

    def embed_documents(self, texts: list[str]) -> list[list[float]]: ...


class OpenAIEmbedder:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = OpenAI(
            api_key=settings.openai_api_key,
            timeout=settings.openai_timeout_seconds,
        )

    def embed_query(self, text: str) -> list[float]:
        safe = text.strip()
        if not safe:
            raise ValueError("빈 텍스트는 embedding을 생성할 수 없습니다.")
        return self.embed_documents([safe])[0]

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        cleaned = [t.strip() for t in texts]
        if any(not t for t in cleaned):
            raise ValueError("빈 청크는 embedding을 생성할 수 없습니다.")

        batch_size = max(1, self._settings.embedding_batch_size)
        out: list[list[float]] = []

        try:
            for i in range(0, len(cleaned), batch_size):
                batch = cleaned[i : i + batch_size]
                response = self._client.embeddings.create(
                    model=self._settings.embedding_model,
                    input=batch,
                )
                out.extend(item.embedding for item in response.data)
        except (APITimeoutError, RateLimitError, APIError) as e:
            raise_for_openai(e, what="임베딩")

        if len(out) != len(cleaned):
            raise UpstreamError("임베딩 응답 개수가 입력과 일치하지 않습니다.")
        return out
