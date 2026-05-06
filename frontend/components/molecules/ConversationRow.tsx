"use client";

import styled, { css } from "styled-components";

const Row = styled.button<{ $active: boolean }>`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  ${({ $active }) =>
    $active
      ? css`
          background: #1e3a8a;
          color: #fff;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        `
      : css`
          color: #334155;
          &:hover {
            background: #f1f5f9;
          }
        `}
`;

const Title = styled.span`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
`;

const Time = styled.span<{ $active: boolean }>`
  ${({ $active }) =>
    $active
      ? css`
          color: #dbeafe;
        `
      : css`
          color: #94a3b8;
        `}
`;

type ConversationRowProps = {
  title: string;
  time: string;
  active?: boolean;
  onClick?: () => void;
};

export function ConversationRow({ title, time, active, onClick }: ConversationRowProps) {
  return (
    <Row type="button" $active={!!active} onClick={onClick}>
      <Title>{title}</Title>
      <Time $active={!!active}>{time}</Time>
    </Row>
  );
}
