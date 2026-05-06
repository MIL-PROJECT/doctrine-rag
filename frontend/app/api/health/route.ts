import { NextResponse } from "next/server";
import { getInternalApiBaseUrl } from "@/lib/env";

export async function GET() {
  const backend = getInternalApiBaseUrl();

  try {
    const res = await fetch(`${backend}/health`, { cache: "no-store" });
    const data = await res.json().catch(() => ({ status: "unknown" }));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { status: "error", detail: "백엔드에 연결할 수 없습니다." },
      { status: 502 }
    );
  }
}
