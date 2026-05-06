import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { docId: string } };

export async function GET(request: NextRequest, { params }: Ctx) {
  const docId = decodeURIComponent(params.docId);
  const page = request.nextUrl.searchParams.get("page") ?? "1";

  return NextResponse.json({
    doc_id: docId,
    page,
    note: "PDF 직링크는 백엔드에 별도 엔드포인트가 없어 JSON 안내만 반환합니다. 원문은 data/doctrine 의 파일을 확인하세요.",
  });
}
