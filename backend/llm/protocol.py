"""LLM abstraction — swap implementations without touching RAG orchestration."""

from __future__ import annotations

from typing import Protocol, runtime_checkable


@runtime_checkable
class LLMClient(Protocol):
    def generate(self, system_prompt: str, user_prompt: str) -> str: ...
