"use client";

import { DoctrineSearchBar } from "@/components/molecules/DoctrineSearchBar";
import { Icon } from "@/components/atoms/Icon";
import styled from "styled-components";

const RELATED_DOCTRINES = [
  {
    documentNo: "NWP 1",
    title: "Naval Warfare",
    keyword: "Sea Control · Command of the Seas",
    description: "해상통제, 해양 우세, 해군 전투력 운용의 기본 개념을 확인할 때 우선 검토할 교범입니다.",
  },
  {
    documentNo: "NWP 3-30.1",
    title: "Maritime Operations",
    keyword: "Maritime Operations · Sea Denial",
    description: "해상작전 수행, 합동전력 운용, 해상 접근 제한과 관련된 내용을 함께 검토할 수 있습니다.",
  },
  {
    documentNo: "JP 3-32",
    title: "Maritime Security",
    keyword: "Maritime Security · Freedom of Maneuver",
    description: "해양안보, 기동의 자유, 해상 작전환경 판단 요소와 연관된 참고 교범 후보입니다.",
  },
];

const Section = styled.section`
  min-width: 0;
  background: #fff;
  padding: 1.5rem;
`;

const Header = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
`;

const Description = styled.p`
  margin: 0.5rem 0 0;
  color: #64748b;
  line-height: 1.6;
`;

const SearchArea = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  margin-bottom: 1.25rem;
  background: #fff;
  padding-bottom: 1rem;
`;

const EmptyGuide = styled.div`
  margin-top: 1.25rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  padding: 2rem;
  text-align: center;
  color: #64748b;
`;

const GuideIcon = styled.div`
  margin: 0 auto 1rem;
  display: flex;
  height: 3.5rem;
  width: 3.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #e0f2fe;
  color: #075985;
`;

const WarningPage = styled.div`
  margin-top: 1.25rem;
  border-radius: 1.25rem;
  border: 1px solid #fecaca;
  background: linear-gradient(180deg, #fff7ed 0%, #fff 48%, #fef2f2 100%);
  padding: 2.5rem;
  text-align: center;
  box-shadow: 0 18px 35px -32px rgb(127 29 29 / 0.5);
`;

const WarningIcon = styled.div`
  margin: 0 auto 1.25rem;
  display: flex;
  height: 4.5rem;
  width: 4.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid #fca5a5;
  background: #fee2e2;
  color: #b91c1c;
`;

const WarningTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #991b1b;
`;

const WarningText = styled.p`
  margin: 0.75rem auto 0;
  max-width: 36rem;
  color: #7f1d1d;
  line-height: 1.7;
`;

const QueryBadge = styled.div`
  margin: 1.5rem auto 0;
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border: 1px solid #fed7aa;
  background: #fff7ed;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: #9a3412;
`;

const RelatedSection = styled.section`
  margin-top: 1.5rem;
  text-align: left;
`;

const RelatedTitle = styled.h3`
  margin: 0 0 0.875rem;
  font-size: 1.125rem;
  font-weight: 900;
  color: #0f172a;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
`;

const RelatedCard = styled.article`
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: #fff;
  padding: 1rem;
  box-shadow: 0 10px 25px -24px rgb(15 23 42 / 0.45);
`;

const CardHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

const DocNo = styled.span`
  display: inline-flex;
  border-radius: 9999px;
  background: #dbeafe;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 900;
  color: #1e3a8a;
`;

const CardTitle = styled.h4`
  margin: 0.75rem 0 0.25rem;
  font-size: 1rem;
  color: #0f172a;
`;

const Keyword = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #2563eb;
`;

const CardText = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #475569;
`;

type DoctrineSearchWorkspaceProps = {
  query: string;
  submittedQuery: string;
  searched: boolean;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
};

export function DoctrineSearchWorkspace({
  query,
  submittedQuery,
  searched,
  onQueryChange,
  onSearch,
}: DoctrineSearchWorkspaceProps) {
  return (
    <Section>
      <SearchArea>
        <Header>
          <Title>교범 검색</Title>
          <Description>업로드된 미 해군 교범에서 문서명, 키워드, 문서번호를 검색하는 화면입니다.</Description>
        </Header>
        <DoctrineSearchBar value={query} onChange={onQueryChange} onSubmit={onSearch} />
      </SearchArea>

      {!searched ? (
        <EmptyGuide>
          <GuideIcon>
            <Icon name="file" size={30} />
          </GuideIcon>
          검색어를 입력하면 교범 데이터베이스에서 관련 문서를 조회합니다.
        </EmptyGuide>
      ) : (
        <>
          <WarningPage role="status" aria-live="polite">
            <WarningIcon>
              <Icon name="alert" size={38} />
            </WarningIcon>
            <WarningTitle>해당 교범을 찾을 수 없습니다.</WarningTitle>
            <WarningText>
              현재 등록된 교범 데이터가 없어 정확한 검색 결과를 표시할 수 없습니다. 교범 PDF 업로드와 인덱싱이 완료되면 이 영역에 실제 검색 결과가 표시됩니다.
            </WarningText>
            <QueryBadge>
              <Icon name="search" size={16} />
              검색어: {submittedQuery}
            </QueryBadge>
          </WarningPage>

          <RelatedSection>
            <RelatedTitle>연관 교범 후보</RelatedTitle>
            <CardGrid>
              {RELATED_DOCTRINES.map((doc) => (
                <RelatedCard key={doc.documentNo}>
                  <CardHead>
                    <DocNo>{doc.documentNo}</DocNo>
                    <Icon name="file" size={20} />
                  </CardHead>
                  <CardTitle>{doc.title}</CardTitle>
                  <Keyword>{doc.keyword}</Keyword>
                  <CardText>{doc.description}</CardText>
                </RelatedCard>
              ))}
            </CardGrid>
          </RelatedSection>
        </>
      )}
    </Section>
  );
}
