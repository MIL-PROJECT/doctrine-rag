"use client";

import { DoctrineRagTemplate } from "@/components/templates/DoctrineRagTemplate";
import { mapBackendSourcesToRows } from "@/lib/map-backend-source";
import type { BackendSource, ChatMessage, ChatSourceRow, Conversation, HealthPayload } from "@/lib/types";
import { FormEvent, useCallback, useEffect, useState } from "react";

const SEED_CONVERSATIONS: Conversation[] = [
  { id: "conv-001", title: "Sea Control의 정의는?", time: "14:32", active: true },
  { id: "conv-002", title: "EMCON 절차에 대해 알려줘", time: "13:11" },
  { id: "conv-003", title: "해상기동에서의 임무 분장", time: "어제" },
  { id: "conv-004", title: "Information Superiority란?", time: "어제" },
  { id: "conv-005", title: "Surface Warfare 개요", time: "2일 전" },
];

function timeLabel() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("채팅");
  const [input, setInput] = useState("");
  const [chatTitle, setChatTitle] = useState("새 대화");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "DoctrineRAG에 오신 것을 환영합니다. 아래 입력창에 교리 관련 질문을 입력하면 로컬 Chroma 인덱스와 Ollama가 답변을 생성합니다.",
      time: timeLabel(),
    },
  ]);
  const [sources, setSources] = useState<ChatSourceRow[]>([]);
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("");
  const [searchSearched, setSearchSearched] = useState(false);
  const [sourceDocumentQuery, setSourceDocumentQuery] = useState("");
  const [selectedPdfFileName, setSelectedPdfFileName] = useState<string | undefined>(undefined);
  const [sourceResetKey, setSourceResetKey] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const refreshHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data = (await res.json()) as HealthPayload;
      setHealth(data);
    } catch {
      setHealth({ status: "error" });
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    const t = setInterval(refreshHealth, 15000);
    return () => clearInterval(t);
  }, [refreshHealth]);

  async function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || busy) return;

    const t = timeLabel();
    setInput("");
    setChatTitle(question.length > 42 ? `${question.slice(0, 42)}…` : question);
    setMessages((prev) => [...prev, { role: "user", content: question, time: t }]);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, top_k: 5 }),
      });
      const data = (await res.json()) as { answer?: string; detail?: string; sources?: BackendSource[] };

      if (!res.ok) {
        const msg = data.detail || "요청 실패";
        setMessages((prev) => [...prev, { role: "assistant", content: msg, time: timeLabel() }]);
        setSources([]);
        return;
      }

      const rows = mapBackendSourcesToRows(data.sources ?? []);
      setSources(rows);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer || "", time: timeLabel() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "API 호출 중 오류가 발생했습니다. Next 서버와 FastAPI 백엔드 연결을 확인하세요.",
          time: timeLabel(),
        },
      ]);
      setSources([]);
    } finally {
      setBusy(false);
      await refreshHealth();
    }
  }


  function handleDoctrineSearch() {
    const keyword = searchQuery.trim();
    if (!keyword) return;
    setSubmittedSearchQuery(keyword);
    setSearchSearched(true);
  }

  function handleSourcePdfSelect(file: File) {
    setSelectedPdfFileName(file.name);
  }

  function resetDoctrineSearchPage() {
    setSearchQuery("");
    setSubmittedSearchQuery("");
    setSearchSearched(false);
  }

  function resetSourceDocumentsPage() {
    setSourceDocumentQuery("");
    setSelectedPdfFileName(undefined);
    setSourceResetKey((key) => key + 1);
  }

  function handleTabChange(tab: string) {
    if (tab === "교범 검색") {
      resetDoctrineSearchPage();
    }

    if (tab === "출처 문서") {
      resetSourceDocumentsPage();
    }

    setActiveTab(tab);
  }

  function handleNewChat() {
    setActiveTab("채팅");
    setChatTitle("새 대화");
    setSources([]);
    setInput("");
    setMessages([
      {
        role: "assistant",
        content:
          "DoctrineRAG에 오신 것을 환영합니다. 아래 입력창에 교리 관련 질문을 입력하면 로컬 Chroma 인덱스와 Ollama가 답변을 생성합니다.",
        time: timeLabel(),
      },
    ]);
  }

  return (
    <DoctrineRagTemplate
      activeTab={activeTab}
      onTabChange={handleTabChange}
      conversations={SEED_CONVERSATIONS}
      health={health}
      chatTitle={chatTitle}
      messages={messages}
      sources={sources}
      input={input}
      onInputChange={setInput}
      onChatSubmit={handleChatSubmit}
      chatBusy={busy}
      onNewChat={handleNewChat}
      searchQuery={searchQuery}
      submittedSearchQuery={submittedSearchQuery}
      searchSearched={searchSearched}
      onSearchQueryChange={setSearchQuery}
      onDoctrineSearch={handleDoctrineSearch}
      sourceDocumentQuery={sourceDocumentQuery}
      selectedPdfFileName={selectedPdfFileName}
      sourceResetKey={sourceResetKey}
      onSourceDocumentQueryChange={setSourceDocumentQuery}
      onSourcePdfSelect={handleSourcePdfSelect}
      darkMode={darkMode}
      onDarkModeChange={setDarkMode}
    />
  );
}
