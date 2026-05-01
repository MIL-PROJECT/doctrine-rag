"use client";

import { useState } from "react";

type Source = {
  source: string;
  chunk_index: number;
  distance: number | null;
  preview: string;
};

export default function HomePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function uploadFile() {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setStatus("문서 업로드 및 벡터화 중...");

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "업로드 실패");
      }

      setStatus(`업로드 완료: ${data.filename}, ${data.chunks}개 chunk 저장`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "오류 발생");
    } finally {
      setLoading(false);
    }
  }

  async function askQuestion() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setSources([]);
    setStatus("답변 생성 중...");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question,
          top_k: 5
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "질문 실패");
      }

      setAnswer(data.answer);
      setSources(data.sources || []);
      setStatus("답변 완료");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "오류 발생");
    } finally {
      setLoading(false);
    }
  }

  async function resetDb() {
    setLoading(true);
    setStatus("DB 초기화 중...");

    try {
      const res = await fetch(`${API_URL}/reset`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "초기화 실패");
      }

      setAnswer("");
      setSources([]);
      setStatus(data.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "오류 발생");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "32px" }}>
      <section
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
        }}
      >
        <h1 style={{ margin: 0, fontSize: "32px" }}>DoctrineRAG</h1>
        <p style={{ color: "#6b7280" }}>
          교리 문서 기반 RAG AI 챗봇 — 발표용 MVP
        </p>

        <div style={{ marginTop: "24px", padding: "20px", border: "1px solid #e5e7eb", borderRadius: "16px" }}>
          <h2>1. 문서 업로드</h2>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            onClick={uploadFile}
            disabled={loading || !file}
            style={{
              marginLeft: "12px",
              padding: "10px 16px",
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: "10px"
            }}
          >
            업로드
          </button>

          <button
            onClick={resetDb}
            disabled={loading}
            style={{
              marginLeft: "8px",
              padding: "10px 16px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "10px"
            }}
          >
            DB 초기화
          </button>
        </div>

        <div style={{ marginTop: "24px", padding: "20px", border: "1px solid #e5e7eb", borderRadius: "16px" }}>
          <h2>2. 질문하기</h2>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예: 방어작전에서 예비대의 역할은 무엇인가?"
            style={{
              width: "100%",
              height: "120px",
              padding: "14px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              fontSize: "16px"
            }}
          />

          <button
            onClick={askQuestion}
            disabled={loading || !question.trim()}
            style={{
              marginTop: "12px",
              padding: "10px 18px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px"
            }}
          >
            질문하기
          </button>
        </div>

        {status && (
          <p style={{ marginTop: "18px", color: loading ? "#2563eb" : "#374151" }}>
            {status}
          </p>
        )}

        {answer && (
          <div style={{ marginTop: "24px", padding: "20px", border: "1px solid #e5e7eb", borderRadius: "16px" }}>
            <h2>답변</h2>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
              {answer}
            </p>
          </div>
        )}

        {sources.length > 0 && (
          <div style={{ marginTop: "24px", padding: "20px", border: "1px solid #e5e7eb", borderRadius: "16px" }}>
            <h2>출처</h2>

            {sources.map((src, idx) => (
              <div
                key={idx}
                style={{
                  marginTop: "12px",
                  padding: "14px",
                  background: "#f9fafb",
                  borderRadius: "12px"
                }}
              >
                <strong>
                  {src.source} / chunk {src.chunk_index}
                </strong>

                <p style={{ color: "#6b7280", fontSize: "14px" }}>
                  distance: {src.distance === null ? "N/A" : src.distance}
                </p>

                <p style={{ whiteSpace: "pre-wrap" }}>{src.preview}...</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
