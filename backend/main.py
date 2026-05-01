import logging
import os
from contextlib import asynccontextmanager
from typing import Annotated, Any

from fastapi import Depends, FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from config import Settings, require_openai_api_key, validate_settings
from embeddings.openai_provider import OpenAIEmbedder
from exceptions import AppError
from llm.openai_chat import OpenAIChatLLM
from logging_config import setup_logging
from rag.pipeline import RAGPipeline
from validators import (
    assert_allowed_extension,
    assert_file_size,
    assert_question,
    assert_top_k,
    safe_filename,
    validate_pdf_magic,
)
from vector_store.chroma_store import ChromaVectorStore

logger = logging.getLogger(__name__)

settings = Settings.from_env()
validate_settings(settings)
setup_logging(settings.log_level)
if not settings.openai_api_key or settings.openai_api_key == "your_openai_api_key":
    logger.warning(
        "OPENAI_API_KEY가 없거나 placeholder입니다. /upload·/chat 는 503을 반환합니다."
    )


def _build_pipeline(app_settings: Settings) -> RAGPipeline:
    embedder = OpenAIEmbedder(app_settings)
    store = ChromaVectorStore(app_settings)
    llm = OpenAIChatLLM(settings=app_settings)
    return RAGPipeline(app_settings, embedder, store, llm)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.settings = settings
    app.state.rag = _build_pipeline(settings)
    logger.info("startup_complete service=doctrine_rag")
    yield
    logger.info("shutdown_complete service=doctrine_rag")


app = FastAPI(title="DoctrineRAG API", version="1.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "code": exc.code},
    )


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_rag(request: Request) -> RAGPipeline:
    return request.app.state.rag


SettingsDep = Annotated[Settings, Depends(get_settings)]
RAGDep = Annotated[RAGPipeline, Depends(get_rag)]


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok", "service": "DoctrineRAG API"}


@app.get("/health/live")
def health_live() -> dict[str, str]:
    return {"status": "alive"}


@app.get("/health/ready")
def health_ready(rag: RAGDep) -> JSONResponse:
    try:
        n = rag.vector_document_count()
    except Exception as e:
        logger.exception("health_ready_failed")
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "vector_store": "error", "detail": str(e)},
        )
    return JSONResponse(
        status_code=200,
        content={"status": "ready", "vector_documents": n},
    )


@app.post("/upload")
async def upload_document(
    app_settings: SettingsDep,
    rag: RAGDep,
    file: UploadFile = File(...),
):
    require_openai_api_key(app_settings)
    assert_allowed_extension(file.filename or "")
    name = safe_filename(file.filename or "")

    os.makedirs(app_settings.upload_dir, exist_ok=True)
    file_path = os.path.join(app_settings.upload_dir, name)

    total = 0
    with open(file_path, "wb") as buffer:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            assert_file_size(total, app_settings.max_upload_bytes)
            buffer.write(chunk)

    validate_pdf_magic(file_path)

    def _ingest() -> dict[str, int]:
        return rag.ingest_document(file_path)

    try:
        result = await run_in_threadpool(_ingest)
    except Exception:
        logger.exception("upload_ingest_failed filename=%s", name)
        raise

    return {
        "message": "문서 업로드 및 벡터 저장 완료",
        "filename": name,
        "chunks": result["chunks"],
    }


@app.post("/chat")
async def chat(body: ChatRequest, rag: RAGDep, app_settings: SettingsDep):
    require_openai_api_key(app_settings)
    q = assert_question(body.question, app_settings.max_question_length)
    k = assert_top_k(body.top_k)

    def _ask() -> dict[str, Any]:
        return rag.ask_question(q, k)

    return await run_in_threadpool(_ask)


@app.delete("/reset")
def reset(rag: RAGDep) -> dict[str, str]:
    rag.reset_vector_store()
    return {"message": "벡터 DB 초기화 완료"}
