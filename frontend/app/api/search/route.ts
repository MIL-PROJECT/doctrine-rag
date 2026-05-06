import { NextRequest, NextResponse } from "next/server";
import { getInternalApiBaseUrl } from "@/lib/env";

/** RAG를 한 번 호출해 스니펫 목록으로 재사용하는 간이 검색 (전용 검색 API 없음). */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim() || "Sea Control";
  const backend = getInternalApiBaseUrl();

  try {
    const res = await fetch(`${backend}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, top_k: 5 }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      answer?: string;
      sources?: Array<{ source?: string; preview?: string; distance?: number | null }>;
    };

    if (!res.ok) {
      return NextResponse.json({ query: q, results: [], error: "backend_error" }, { status: 200 });
    }

    const rows = (data.sources ?? []).map((s, i) => ({
      doc_id: String(s.source ?? `doc-${i}`),
      title: String(s.source ?? "출처"),
      year: "—",
      page: `hit ${i + 1}`,
      snippet: String(s.preview ?? "").slice(0, 240),
      score: s.distance === null || s.distance === undefined ? null : s.distance,
    }));

    return NextResponse.json({
      query: q,
      answer_preview: String(data.answer ?? "").slice(0, 400),
      results: rows,
    });
  } catch {
    return NextResponse.json({ query: q, results: [], error: "unreachable" }, { status: 200 });
  }
}
