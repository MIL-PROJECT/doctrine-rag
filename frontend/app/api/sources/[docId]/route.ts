import { NextResponse } from "next/server";

type Ctx = { params: { docId: string } };

export async function GET(_: Request, { params }: Ctx) {
  const docId = decodeURIComponent(params.docId);

  return NextResponse.json({
    doc_id: docId,
    title: docId,
    publisher: "로컬 코퍼스",
    year: "—",
    file_path: `backend/data/doctrine/${docId}`,
    note: "메타데이터는 UI용 스텁입니다. 실제 파일은 서버 data/doctrine 을 확인하세요.",
  });
}
