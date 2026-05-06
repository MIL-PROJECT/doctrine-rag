import { NextRequest, NextResponse } from "next/server";
import { getInternalApiBaseUrl } from "@/lib/env";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const question = String(body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ detail: "question이 비어 있습니다." }, { status: 400 });
  }

  const top_k = typeof body.top_k === "number" && body.top_k >= 1 && body.top_k <= 20 ? body.top_k : 5;
  const backend = getInternalApiBaseUrl();

  try {
    const res = await fetch(`${backend}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, top_k }),
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (!res.ok) {
      const detail = typeof data.detail === "string" ? data.detail : "백엔드 요청 실패";
      return NextResponse.json({ detail }, { status: res.status });
    }

    return NextResponse.json({
      conversation_id: body.conversation_id ?? "conv-001",
      question,
      answer: String(data.answer ?? ""),
      sources: Array.isArray(data.sources) ? data.sources : [],
    });
  } catch {
    return NextResponse.json({ detail: "백엔드에 연결할 수 없습니다. API URL과 서버 기동을 확인하세요." }, { status: 502 });
  }
}
