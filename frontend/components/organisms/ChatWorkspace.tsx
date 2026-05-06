"use client";

import { ChatMessageBlock } from "@/components/molecules/ChatMessageBlock";
import { PromptComposer } from "@/components/molecules/PromptComposer";
import type { ChatMessage } from "@/lib/types";
import { FormEvent } from "react";
import styled from "styled-components";

const Section = styled.section`
  background: #fff;
  padding: 1.75rem 2rem;
`;

const Toolbar = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1.5rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
`;

const ToolButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ToolButton = styled.button`
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  background: #fff;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const BusyText = styled.p`
  margin: 1.5rem 0 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e40af;
`;

type ChatWorkspaceProps = {
  title: string;
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  busy?: boolean;
  onNewChat?: () => void;
};

export function ChatWorkspace({ title, messages, input, onInputChange, onSubmit, busy, onNewChat }: ChatWorkspaceProps) {
  return (
    <Section>
      <Toolbar>
        <Title>{title}</Title>
        <ToolButtons>
          <ToolButton type="button" onClick={onNewChat}>새 대화</ToolButton>
        </ToolButtons>
      </Toolbar>

      <MessageList>
        {messages.map((message, index) => (
          <ChatMessageBlock key={`${message.role}-${index}-${message.time}`} message={message} index={index} />
        ))}
      </MessageList>

      {busy && <BusyText>답변 생성 중…</BusyText>}

      <PromptComposer value={input} onChange={onInputChange} onSubmit={onSubmit} disabled={busy} />
    </Section>
  );
}
