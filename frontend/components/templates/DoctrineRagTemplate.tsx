"use client";

import { AppHeader } from "@/components/organisms/AppHeader";
import { ChatWorkspace } from "@/components/organisms/ChatWorkspace";
import { ReferenceSourcesPanel } from "@/components/organisms/ReferenceSourcesPanel";
import { SidebarPanel } from "@/components/organisms/SidebarPanel";
import { DoctrineSearchWorkspace } from "@/components/organisms/DoctrineSearchWorkspace";
import { SourceDocumentsWorkspace } from "@/components/organisms/SourceDocumentsWorkspace";
import { bp } from "@/lib/breakpoints";
import type { ChatMessage, ChatSourceRow, Conversation, HealthPayload } from "@/lib/types";
import { FormEvent } from "react";
import styled from "styled-components";

const Page = styled.main<{ $darkMode: boolean }>`
  min-height: 100vh;
  background: ${({ $darkMode }) => ($darkMode ? "#020617" : "#f8fafc")};
  color: ${({ $darkMode }) => ($darkMode ? "#e2e8f0" : "#0f172a")};

  ${({ $darkMode }) =>
    $darkMode
      ? `
    aside, section {
      background: #0f172a;
      border-color: #334155;
    }

    div, article, form, table, th, td {
      border-color: #334155;
    }

    h1, h2, h3, p, td, th, label {
      color: #e2e8f0;
    }

    input, select {
      background: #111827;
      border-color: #334155;
      color: #e2e8f0;
    }

    input::placeholder {
      color: #94a3b8;
    }
  `
      : ""}
`;

const Grid = styled.div`
  display: grid;
  min-height: calc(100dvh - 10rem);
  width: 100%;
  min-width: 0;
  grid-template-columns: 1fr;

  @media (min-width: ${bp.lg}) {
    min-height: calc(100dvh - 5rem);
    grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr) minmax(14rem, 22.5rem);
  }
`;

const PlaceholderSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 2rem;
  text-align: center;
  color: #475569;
`;

const PlaceholderTitle = styled.p`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
`;

const PlaceholderText = styled.p`
  margin: 0.5rem 0 0;
  max-width: 28rem;
  font-size: 0.875rem;
`;

type DoctrineRagTemplateProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  conversations: Conversation[];
  health: HealthPayload | null;
  chatTitle: string;
  messages: ChatMessage[];
  sources: ChatSourceRow[];
  input: string;
  onInputChange: (v: string) => void;
  onChatSubmit: (e: FormEvent<HTMLFormElement>) => void;
  chatBusy?: boolean;
  onNewChat?: () => void;
  searchQuery: string;
  submittedSearchQuery: string;
  searchSearched: boolean;
  onSearchQueryChange: (v: string) => void;
  onDoctrineSearch: () => void;
  sourceDocumentQuery: string;
  selectedPdfFileName?: string;
  sourceResetKey: number;
  onSourceDocumentQueryChange: (v: string) => void;
  onSourcePdfSelect: (file: File) => void;
  darkMode: boolean;
  onDarkModeChange: (enabled: boolean) => void;
};

export function DoctrineRagTemplate({
  activeTab,
  onTabChange,
  conversations,
  health,
  chatTitle,
  messages,
  sources,
  input,
  onInputChange,
  onChatSubmit,
  chatBusy,
  onNewChat,
  searchQuery,
  submittedSearchQuery,
  searchSearched,
  onSearchQueryChange,
  onDoctrineSearch,
  sourceDocumentQuery,
  selectedPdfFileName,
  sourceResetKey,
  onSourceDocumentQueryChange,
  onSourcePdfSelect,
  darkMode,
  onDarkModeChange,
}: DoctrineRagTemplateProps) {
  return (
    <Page $darkMode={darkMode}>
      <AppHeader activeTab={activeTab} onTabChange={onTabChange} />

      <Grid>
        <SidebarPanel
          conversations={conversations}
          health={health}
          onNewChat={onNewChat}
          darkMode={darkMode}
          onDarkModeChange={onDarkModeChange}
        />

        {activeTab === "채팅" ? (
          <ChatWorkspace
            title={chatTitle}
            messages={messages}
            input={input}
            onInputChange={onInputChange}
            onSubmit={onChatSubmit}
            busy={chatBusy}
            onNewChat={onNewChat}
          />
        ) : activeTab === "교범 검색" ? (
          <DoctrineSearchWorkspace
            query={searchQuery}
            submittedQuery={submittedSearchQuery}
            searched={searchSearched}
            onQueryChange={onSearchQueryChange}
            onSearch={onDoctrineSearch}
          />
        ) : activeTab === "출처 문서" ? (
          <SourceDocumentsWorkspace
            key={sourceResetKey}
            query={sourceDocumentQuery}
            selectedFileName={selectedPdfFileName}
            onQueryChange={onSourceDocumentQueryChange}
            onFileSelect={onSourcePdfSelect}
          />
        ) : (
          <PlaceholderSection>
            <div>
              <PlaceholderTitle>{activeTab}</PlaceholderTitle>
              <PlaceholderText>이 탭은 UI 자리입니다. 필요하면 같은 atomic 폴더에 화면을 추가하면 됩니다.</PlaceholderText>
            </div>
          </PlaceholderSection>
        )}

        <ReferenceSourcesPanel sources={sources} />
      </Grid>
    </Page>
  );
}
