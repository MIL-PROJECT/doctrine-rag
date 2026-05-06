"use client";

import { Icon } from "@/components/atoms/Icon";
import type { ChatSourceRow } from "@/lib/types";
import styled from "styled-components";

const Article = styled.article`
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 1rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
`;

const Top = styled.div`
  margin-bottom: 0.75rem;
  display: flex;
  gap: 0.75rem;
`;

const Rank = styled.div`
  display: flex;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: #eff6ff;
  font-weight: 700;
  color: #1e3a8a;
`;

const MetaBlock = styled.div`
  min-width: 0;
  flex: 1;
`;

const Title = styled.h3`
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  font-weight: 700;
  color: #172554;
`;

const MetaLine = styled.div`
  margin-top: 0.25rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #64748b;
`;

const Quote = styled.p`
  margin: 0 0 1rem;
  font-size: 0.875rem;
  font-style: italic;
  line-height: 1.5rem;
  color: #334155;
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const Score = styled.span`
  font-size: 0.875rem;
  color: #64748b;
`;

const MetaLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e3a8a;
  text-decoration: none;

  &:hover {
    background: #f8fafc;
  }
`;

type SourceReferenceCardProps = {
  source: ChatSourceRow;
};

export function SourceReferenceCard({ source }: SourceReferenceCardProps) {
  return (
    <Article>
      <Top>
        <Rank>{source.rank}</Rank>
        <MetaBlock>
          <Title>{source.title}</Title>
          <MetaLine>
            <span>{source.year}</span>
            <span>{source.page}</span>
          </MetaLine>
        </MetaBlock>
      </Top>
      <Quote>“{source.quote}”</Quote>
      <Footer>
        <Score>거리(L2): {source.score}</Score>
        <MetaLink href={`/api/sources/${source.docId}/pdf?page=${encodeURIComponent(source.page)}`}>
          메타데이터 <Icon name="external" size={16} />
        </MetaLink>
      </Footer>
    </Article>
  );
}
