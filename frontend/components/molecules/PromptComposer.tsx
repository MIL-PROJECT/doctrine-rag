"use client";

import { FormEvent } from "react";
import { Icon } from "@/components/atoms/Icon";
import styled from "styled-components";

const Form = styled.form`
  margin-top: 2.5rem;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 0.75rem 1rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
`;

const TextInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-size: 1rem;

  &::placeholder {
    color: #94a3b8;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const SendButton = styled.button`
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 9999px;
  background: #1e3a8a;
  color: #fff;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Hint = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.75rem;
  color: #94a3b8;
`;

type PromptComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function PromptComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "교리 관련 질문을 입력하세요...",
}: PromptComposerProps) {
  return (
    <Form onSubmit={onSubmit}>
      <InputRow>
        <TextInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        <SendButton type="submit" disabled={disabled || !value.trim()}>
          <Icon name="send" size={20} />
        </SendButton>
      </InputRow>
      <Hint>※ 답변은 로컬 교리 코퍼스 RAG 결과입니다. 공식 원문·작전 문서와 반드시 대조하세요.</Hint>
    </Form>
  );
}
