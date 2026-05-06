"use client";

import { AvatarCircle } from "@/components/atoms/AvatarCircle";
import { Icon } from "@/components/atoms/Icon";
import type { ChatMessage } from "@/lib/types";
import styled, { css } from "styled-components";

const Row = styled.div<{ $divided: boolean }>`
  display: flex;
  gap: 1.25rem;

  ${({ $divided }) =>
    $divided &&
    css`
      border-top: 1px solid #e2e8f0;
      padding-top: 2rem;
    `}
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const Meta = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Role = styled.p`
  margin: 0;
  font-weight: 700;
  color: #172554;
`;

const Time = styled.span`
  font-size: 0.875rem;
  color: #94a3b8;
`;

const Content = styled.p`
  margin: 0;
  white-space: pre-wrap;
  font-size: 1.125rem;
  line-height: 2rem;
  color: #1e293b;
`;

type ChatMessageBlockProps = {
  message: ChatMessage;
  index: number;
};

export function ChatMessageBlock({ message, index }: ChatMessageBlockProps) {
  return (
    <Row $divided={index > 0}>
      <AvatarCircle tone={message.role === "user" ? "user" : "assistant"}>
        {message.role === "user" ? "U" : <Icon name="anchor" size={24} />}
      </AvatarCircle>
      <Body>
        <Meta>
          <Role>{message.role === "user" ? "사용자" : "어시스턴트"}</Role>
          <Time>{message.time}</Time>
        </Meta>
        <Content>{message.content}</Content>
      </Body>
    </Row>
  );
}
