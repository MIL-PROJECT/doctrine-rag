"""Ollama Chat API — http://ollama:11434/api/chat"""

from __future__ import annotations

import logging

import httpx

import config

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are a helpful assistant that answers strictly from the provided document evidence (RAG).
Rules:
1. Use only the information in the evidence blocks. If the evidence is insufficient, say so clearly in Korean.
2. Do not invent facts not present in the evidence.
3. Answer in Korean with sections: 요약, 근거 (cite evidence numbers), 한계.
4. Keep a calm, educational tone suitable for training materials.
""".strip()


def generate_answer(question: str, context: str) -> str:
    url = f"{config.OLLAMA_BASE_URL}/api/chat"
    user_content = f"""[Question]
{question}

[Evidence from documents]
{context}

Answer in Korean using only the evidence above.""".strip()

    payload = {
        "model": config.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        "stream": False,
        "options": {"temperature": 0.2},
    }

    try:
        with httpx.Client(timeout=config.OLLAMA_TIMEOUT_SECONDS) as client:
            r = client.post(url, json=payload)
            r.raise_for_status()
            data = r.json()
    except httpx.HTTPStatusError as e:
        logger.exception("Ollama HTTP error")
        raise RuntimeError(f"Ollama API HTTP error: {e.response.text}") from e
    except httpx.RequestError as e:
        logger.exception("Ollama request failed")
        raise RuntimeError(
            f"Cannot reach Ollama at {config.OLLAMA_BASE_URL}. Is the ollama service up?"
        ) from e

    message = data.get("message") or {}
    content = message.get("content") or ""
    return content.strip()


def ollama_healthcheck() -> bool:
    try:
        with httpx.Client(timeout=5.0) as client:
            r = client.get(f"{config.OLLAMA_BASE_URL}/api/tags")
            return r.status_code == 200
    except httpx.RequestError:
        return False
