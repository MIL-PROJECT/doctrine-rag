import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

import config
from llm import ollama_healthcheck
from rag_service import ask_question, full_reset_and_reingest, run_startup_ingest
import vector_store

logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL, logging.INFO),
    format="%(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Startup: running ingest if needed (INGEST_MODE=%s)...", config.INGEST_MODE)
    await run_in_threadpool(run_startup_ingest)
    logger.info("Startup: ingest step finished. Chroma count=%s", vector_store.collection_count())
    yield
    logger.info("Shutdown complete.")


app = FastAPI(title="DoctrineRAG Ollama API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=config.TOP_K_MAX)


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict[str, Any]]


@app.get("/health")
def health() -> dict[str, Any]:
    vdb = vector_store.collection_stats()
    return {
        "api": "ok",
        "status": "ok",
        "service": "doctrine-rag-ollama",
        "vector_db": vdb,
        "chroma_documents": vdb["documents"],
        "ollama_reachable": ollama_healthcheck(),
        "ollama_model": config.OLLAMA_MODEL,
        "ingest_flag": config.INGEST_FLAG_PATH.exists(),
        "ingest_mode": config.INGEST_MODE,
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    try:

        def _ask() -> dict[str, Any]:
            return ask_question(body.question.strip(), top_k=body.top_k)

        data = await run_in_threadpool(_ask)
        return ChatResponse(answer=data["answer"], sources=data.get("sources") or [])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.delete("/reset")
async def reset() -> dict[str, Any]:
    try:
        return await run_in_threadpool(full_reset_and_reingest)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
