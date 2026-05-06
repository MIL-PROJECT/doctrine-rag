/** 브라우저가 호스트의 FastAPI에 붙을 때 (로컬 개발·Docker 공통) */
export function getPublicApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
}

/** Next Route Handler 전용: 컨테이너 안에서는 서비스명 backend 사용 */
export function getInternalApiBaseUrl(): string {
  const internal = process.env.BACKEND_INTERNAL_URL?.trim();
  if (internal) return internal.replace(/\/$/, "");
  return getPublicApiBaseUrl();
}
