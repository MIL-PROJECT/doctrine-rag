"use client";

import { SourceReferenceCard } from "@/components/molecules/SourceReferenceCard";
import type { ChatSourceRow } from "@/lib/types";
import styled from "styled-components";

const Aside = styled.aside`
  border-left: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 1.25rem;
`;

const Head = styled.div`
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeadTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
`;

const IconButton = styled.button`
  display: flex;
  height: 2.25rem;
  width: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
  }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyHint = styled.p`
  margin: 0;
  border-radius: 0.75rem;
  border: 1px dashed #e2e8f0;
  background: #fff;
  padding: 1rem;
  font-size: 0.875rem;
  color: #64748b;
`;

const ViewAllButton = styled.button`
  margin-top: 1rem;
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 0.75rem;
  font-weight: 700;
  color: #1e3a8a;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #f8fafc;
  }
`;

type ReferenceSourcesPanelProps = {
  sources: ChatSourceRow[];
};

export function ReferenceSourcesPanel({ sources }: ReferenceSourcesPanelProps) {
  return (
    <Aside>
      <Head>
        <HeadTitle>참고 출처 ({sources.length})</HeadTitle>
        <IconButton type="button" aria-label="패널 확장">
          ↗
        </IconButton>
      </Head>

      <CardList>
        {sources.length === 0 ? (
          <EmptyHint>질문을 내면 검색된 청크가 여기에 표시됩니다.</EmptyHint>
        ) : (
          sources.map((source) => <SourceReferenceCard key={`${source.docId}-${source.rank}`} source={source} />)
        )}
      </CardList>

      <ViewAllButton type="button" disabled={sources.length === 0}>
        모든 출처 보기
      </ViewAllButton>
    </Aside>
  );
}
