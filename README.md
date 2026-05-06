# DoctrineRAG · Ollama

교리·참고 문서를 **사전에** `backend/data/doctrine/`에 두고, **로컬 임베딩(SentenceTransformers) + ChromaDB + Ollama**로 질의응답하는 RAG 데모입니다. **OpenAI API·키·의존성은 사용하지 않습니다.**

## 프로젝트 개요

| 구분 | 기술 |
|------|------|
| 프론트 | Next.js 14 |
| API | FastAPI |
| 벡터 DB | ChromaDB (영속 볼륨) |
| 임베딩 | `paraphrase-multilingual-MiniLM-L12-v2` (로컬) |
| LLM | Ollama `qwen2.5:3b` (`/api/chat`) |
| 실행 | Docker Compose (`ollama`, `ollama-init`, `backend`, `frontend`) |

사용자는 **문서를 업로드하지 않습니다.** 운영/배포 전에 PDF·TXT를 `backend/data/doctrine/`에 넣어 두고, 백엔드 기동 시 자동 인제스트됩니다.

## 아키텍처

```text
[Browser] ──► Next.js :3000
                  │
                  ▼ POST /chat
            FastAPI :8000
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
data/doctrine   Chroma      Ollama :11434
 (시작 시       (벡터)       (qwen2.5:3b)
  인제스트)
     │
     ▼
SentenceTransformers
 (질문·청크 임베딩)
```

## RAG 동작

1. **기동 시** (`chroma_db/.ingested` 없을 때만): `data/doctrine/*.pdf|*.txt` 로드 → 청킹 → 로컬 임베딩 → Chroma 저장 → `.ingested` 생성  
2. **이후 기동**: `.ingested`가 있으면 인제스트 생략  
3. **질의**: 질문 임베딩 → Chroma 상위 `top_k` 검색 → 컨텍스트 구성 → Ollama 채팅 → 답변 + 출처

## OpenAI 대신 Ollama를 쓰는 방식

| 역할 | OpenAI 버전 | 이 저장소 |
|------|-------------|-----------|
| 임베딩 | `embeddings.create` | SentenceTransformers (Hugging Face 캐시) |
| 생성 | Chat Completions | `POST {OLLAMA_BASE_URL}/api/chat`, `stream: false` |
| 인증 | API 키 | 없음 (로컬 Ollama) |

환경 변수 `OLLAMA_BASE_URL`은 Compose에서 `http://ollama:11434` 로 설정합니다.

## Docker로 실행

**요구:** Docker Desktop, 충분한 디스크(RAM 권장 8GB+, 첫 빌드·모델 다운로드에 시간 소요).

```bash
cd doctrine-rag-ollama
docker compose up --build
```

접속:

- UI: http://localhost:3000  
- API: http://localhost:8000  
- 헬스: http://localhost:8000/health  
- Ollama(호스트 디버깅): http://localhost:11434  

### 첫 실행 시 주의 (시간이 오래 걸릴 수 있음)

1. **`ollama-init`**: `qwen2.5:3b` pull (네트워크·용량에 따라 수 분~십 수 분).  
2. **백엔드 기동**: Hugging Face에서 임베딩 모델을 받아 캐시 볼륨에 저장(최초 1회 크고 느릴 수 있음).  
3. **인제스트**: 문서량에 따라 추가 시간.  
4. 프론트는 백엔드 **헬스체크 통과 후** 기동합니다. `start_period`를 길게 두었으나, 여전히 **로그를 보며** 기다리는 것이 안전합니다.

```bash
docker compose logs -f backend ollama-init
```

## API

### `GET /health`

상태, Chroma 문서 수, Ollama 연결 여부, 인제스트 플래그 등.

### `POST /chat`

요청:

```json
{
  "question": "방어작전에서 예비대의 역할은 무엇인가?",
  "top_k": 5
}
```

응답:

```json
{
  "answer": "...",
  "sources": [
    {
      "source": "sample_doctrine.txt",
      "chunk_index": 0,
      "distance": 0.123,
      "preview": "..."
    }
  ]
}
```

### `DELETE /reset`

Chroma 초기화, `.ingested` 삭제 후 **동일 데이터 디렉터리에서 재인제스트** (관리/개발용).

**공개 `POST /upload`는 없습니다.**

## 데모 질문 예시

- 방어작전의 목적은 무엇인가?  
- 예비대는 어떤 상황에서 운용되는가?  
- 지휘관 판단 시 고려 요소는?  
- RAG가 환각을 줄이는 이유는?

(기본 `backend/data/doctrine/sample_doctrine.txt` 기준)

## 교리 데이터 넣는 법

1. 호스트에서 `backend/data/doctrine/` 에 `.pdf` / `.txt` 추가  
2. 이미 `.ingested`가 있는 볼륨이면: `docker compose down` 후 볼륨 삭제 **또는** `DELETE /reset` 호출  
3. 백엔드 재시작 후 인제스트 반영

## 트러블슈팅

| 증상 | 점검 |
|------|------|
| 프론트가 안 뜸 | `docker compose logs backend` — 임베딩 다운로드·인제스트 대기 중일 수 있음 |
| `502` / Ollama 오류 | `ollama-init` 성공 여부, `docker compose logs ollama-init`. 호스트에서 `curl http://localhost:11434/api/tags` |
| 인덱스 0건 | `data/doctrine` 마운트 경로에 파일이 있는지, PDF가 스캔만 있어 텍스트가 비지 않았는지 |
| 느리다 | CPU만 사용 시 임베딩·LLM 모두 느림. 더 작은 Ollama 모델·짧은 문서로 테스트 |
| 디스크 부족 | `docker system prune`, HF/Ollama 볼륨 정리 |

## 로컬 개발 (선택)

- Backend: `cd backend && pip install -r requirements.txt` 후 Ollama를 호스트에 띄우고 `OLLAMA_BASE_URL=http://127.0.0.1:11434 uvicorn main:app --reload`  
- Frontend: `cd frontend && npm install && npm run dev`  
- Docker 없이 쓸 때도 `data/doctrine`·`chroma_db` 경로는 동일하게 유지하세요.

## 디렉터리 구조

```text
doctrine-rag-ollama/
├─ backend/
│  ├─ main.py
│  ├─ config.py
│  ├─ document_loader.py
│  ├─ chunker.py
│  ├─ embeddings.py
│  ├─ vector_store.py
│  ├─ llm.py
│  ├─ rag_service.py
│  ├─ ingest_seed.py
│  ├─ requirements.txt
│  ├─ Dockerfile
│  ├─ data/doctrine/     # 배포 전 교리 원문
│  ├─ uploads/
│  └─ chroma_db/         # 로컬 개발용 (Compose는 볼륨 사용)
├─ frontend/
├─ docker-compose.yml
├─ .env.example
├─ sample_doctrine.txt   # 루트 샘플(참고용, 인제스트는 backend/data/doctrine)
└─ README.md
```

## 라이선스

데모·교육용. 문서 내용·배포 환경에 맞게 이용약관·보안을 별도 검토하세요.


## 다른 PC에서 접속하기

같은 Wi-Fi/LAN에 있는 다른 PC에서 접속하려면 서버 PC에서 Next.js를 `0.0.0.0`으로 실행해야 합니다.

### 1) 서버 PC의 내부 IP 확인

Windows PowerShell:

```bash
ipconfig
```

`IPv4 주소` 값을 확인합니다. 예: `192.168.0.25`

macOS/Linux:

```bash
ifconfig
```

### 2) 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev:network
```

또는 Docker 사용 시:

```bash
docker compose up --build
```

### 3) 다른 PC에서 접속

다른 PC의 Edge 주소창에 아래처럼 입력합니다.

```text
http://서버PC_IP:3000
```

예시:

```text
http://192.168.0.25:3000
```

### 4) 방화벽 허용

접속이 안 되면 서버 PC에서 Windows Defender 방화벽의 인바운드 규칙에 `3000`, 필요 시 `8000` 포트를 허용하세요.

> 프론트엔드는 `/api/*` 프록시를 통해 백엔드에 접근하도록 변경되어, 다른 PC 브라우저가 자신의 `localhost:8000`을 찾는 문제가 발생하지 않습니다.
