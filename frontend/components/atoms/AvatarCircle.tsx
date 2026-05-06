"use client";

import type { ReactNode } from "react";
import styled, { css } from "styled-components";

type Tone = "user" | "assistant";

const Circle = styled.div<{ $tone: Tone }>`
  display: flex;
  height: 2.75rem;
  width: 2.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: #fff;

  ${({ $tone }) =>
    $tone === "user"
      ? css`
          background: #1e3a8a;
        `
      : css`
          background: #020617;
        `}
`;

type AvatarCircleProps = {
  children: ReactNode;
  tone?: Tone;
};

export function AvatarCircle({ children, tone = "user" }: AvatarCircleProps) {
  return <Circle $tone={tone}>{children}</Circle>;
}
