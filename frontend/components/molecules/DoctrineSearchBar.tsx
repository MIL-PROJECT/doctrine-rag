"use client";

import { Icon } from "@/components/atoms/Icon";
import { FormEvent } from "react";
import styled from "styled-components";

const Form = styled.form`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border-radius: 1rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  padding: 0.875rem 1rem;
  box-shadow: 0 10px 25px -20px rgb(15 23 42 / 0.45);
`;

const InputWrap = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
`;

const Input = styled.input`
  min-width: 0;
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #0f172a;
  outline: none;

  &::placeholder {
    color: #94a3b8;
  }
`;

const Button = styled.button`
  flex-shrink: 0;
  border: none;
  border-radius: 0.75rem;
  background: #1d4ed8;
  padding: 0.75rem 1rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;

  &:hover {
    background: #1e40af;
  }

  &:disabled {
    cursor: not-allowed;
    background: #94a3b8;
  }
`;

type DoctrineSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function DoctrineSearchBar({ value, onChange, onSubmit }: DoctrineSearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Form onSubmit={handleSubmit}>
      <InputWrap>
        <Icon name="search" size={22} />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="교범명, 키워드, 문서번호를 검색하세요. 예: NWP 1, Sea Control, EMCON"
          aria-label="교범 검색어"
        />
      </InputWrap>
      <Button type="submit" disabled={!value.trim()}>
        검색
      </Button>
    </Form>
  );
}
