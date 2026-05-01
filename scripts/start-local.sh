#!/usr/bin/env bash
# DoctrineRAG: Docker로 로컬 전체 기동 후 브라우저에서 http://localhost:3000 열기
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker가 없습니다. https://docs.docker.com/desktop/ 에서 설치하세요." >&2
  exit 1
fi

if [[ ! -f .env ]] && [[ -f .env.example ]]; then
  cp .env.example .env
  echo ""
  echo "[알림] .env.example 을 복사해 .env 를 만들었습니다. OPENAI_API_KEY 를 설정하세요."
  echo ""
fi

echo "Docker Compose 기동 중... (최초 빌드는 수 분 걸릴 수 있습니다)"
docker compose up --build -d

echo "http://localhost:3000 응답 대기 중..."
ok=0
for _ in $(seq 1 120); do
  if curl -fsS "http://127.0.0.1:3000/" >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 2
done

if [[ "$ok" -eq 1 ]]; then
  echo "준비 완료. 브라우저를 엽니다."
else
  echo "[경고] 3000 포트 응답 대기 시간 초과. docker compose logs 를 확인하세요."
fi

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:3000/" || true
elif command -v open >/dev/null 2>&1; then
  open "http://localhost:3000/" || true
fi

echo ""
echo "  웹 UI : http://localhost:3000"
echo "  API   : http://localhost:8000/docs"
echo "  중지  : docker compose down"
echo "  로그  : docker compose logs -f"
echo ""
