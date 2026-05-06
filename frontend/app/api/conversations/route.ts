import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    conversations: [
      { conversation_id: "conv-001", title: "Sea Control의 정의는?", updated_at: "2026-05-01T14:32:00" },
      { conversation_id: "conv-002", title: "EMCON 절차에 대해 알려줘", updated_at: "2026-05-01T13:11:00" },
    ],
  });
}

export async function POST() {
  return NextResponse.json({ conversation_id: "conv-new", title: "새 대화" }, { status: 201 });
}
