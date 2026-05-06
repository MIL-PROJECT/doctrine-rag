"use client";

import { UploadDropzone } from "@/components/molecules/UploadDropzone";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

type SourceDocumentRow = {
  id: string;
  doctrineName: string;
  keyword: string;
  documentNo: string;
  status: string;
};

const MOCK_DOCUMENTS: SourceDocumentRow[] = [
  {
    id: "doc-001",
    doctrineName: "NWP 1: Naval Warfare",
    keyword: "Sea Control, Naval Warfare, Command of the Seas",
    documentNo: "NWP 1",
    status: "업로드 대기",
  },
  {
    id: "doc-002",
    doctrineName: "NWP 3-30.1: Maritime Operations",
    keyword: "Maritime Operations, Sea Denial, Joint Force",
    documentNo: "NWP 3-30.1",
    status: "업로드 대기",
  },
  {
    id: "doc-003",
    doctrineName: "JP 3-32: Maritime Security",
    keyword: "Maritime Security, Freedom of Maneuver",
    documentNo: "JP 3-32",
    status: "업로드 대기",
  },
  {
    id: "doc-004",
    doctrineName: "NWP 3-56: Composite Warfare",
    keyword: "Composite Warfare, CWC, Task Organization",
    documentNo: "NWP 3-56",
    status: "업로드 대기",
  },
  {
    id: "doc-005",
    doctrineName: "NWP 3-20: Surface Warfare",
    keyword: "Surface Warfare, Sea Control, Surface Action Group",
    documentNo: "NWP 3-20",
    status: "업로드 대기",
  },
  {
    id: "doc-006",
    doctrineName: "NWP 3-22: Anti-Submarine Warfare",
    keyword: "ASW, Undersea Warfare, Maritime Operations",
    documentNo: "NWP 3-22",
    status: "업로드 대기",
  },
  {
    id: "doc-007",
    doctrineName: "NWP 3-01: Air and Missile Defense",
    keyword: "Air Defense, Missile Defense, Fleet Defense",
    documentNo: "NWP 3-01",
    status: "업로드 대기",
  },
  {
    id: "doc-008",
    doctrineName: "NWP 3-13: Information Operations",
    keyword: "Information Operations, Information Superiority, C2",
    documentNo: "NWP 3-13",
    status: "업로드 대기",
  },
  {
    id: "doc-009",
    doctrineName: "NWP 3-32: Amphibious Operations",
    keyword: "Amphibious Operations, Expeditionary, Joint Force",
    documentNo: "NWP 3-32",
    status: "업로드 대기",
  },
  {
    id: "doc-010",
    doctrineName: "NWP 4-01: Naval Logistics",
    keyword: "Logistics, Sustainment, Fleet Support",
    documentNo: "NWP 4-01",
    status: "업로드 대기",
  },
  {
    id: "doc-011",
    doctrineName: "NWP 5-01: Navy Planning",
    keyword: "Planning, Operational Design, Mission Analysis",
    documentNo: "NWP 5-01",
    status: "업로드 대기",
  },
  {
    id: "doc-012",
    doctrineName: "NWP 6-02: Communications",
    keyword: "Communications, C2, EMCON",
    documentNo: "NWP 6-02",
    status: "업로드 대기",
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
  font-weight: 900;
  color: #0f172a;
`;

const Description = styled.p`
  margin: 0.5rem 0 0;
  color: #64748b;
  line-height: 1.6;
`;

const Stack = styled.div`
  display: grid;
  gap: 1.25rem;
`;

const FilterCard = styled.div`
  display: grid;
  gap: 0.75rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FilterField = styled.label`
  display: grid;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 800;
  color: #334155;
`;

const Select = styled.select`
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  padding: 0.75rem 0.875rem;
  font-size: 0.9375rem;
  color: #0f172a;
  outline: none;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgb(37 99 235 / 0.16);
  }
`;

const TableCard = styled.div`
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 14px 30px -28px rgb(15 23 42 / 0.45);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 900;
  color: #334155;
`;

const Td = styled.td`
  border-bottom: 1px solid #f1f5f9;
  padding: 0.875rem 1rem;
  color: #475569;
  vertical-align: top;
`;

const DocTitle = styled.span`
  font-weight: 800;
  color: #0f172a;
`;

const Badge = styled.span`
  display: inline-flex;
  border-radius: 9999px;
  background: #eff6ff;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 900;
  color: #1d4ed8;
`;

const Status = styled.span`
  display: inline-flex;
  border-radius: 9999px;
  background: #fff7ed;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 900;
  color: #c2410c;
`;

const TableFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0.875rem 1rem;
`;

const PageInfo = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 800;
  color: #475569;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 2.25rem;
  height: 2.25rem;
  border: 1px solid ${({ $active }) => ($active ? "#1d4ed8" : "#cbd5e1")};
  border-radius: 0.65rem;
  background: ${({ $active }) => ($active ? "#1d4ed8" : "#fff")};
  color: ${({ $active }) => ($active ? "#fff" : "#334155")};
  font-size: 0.875rem;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const EmptyCard = styled.div`
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  padding: 2rem;
  text-align: center;
  color: #64748b;
`;

const UploadSection = styled.div`
  display: grid;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 900;
  color: #0f172a;
`;

const Notice = styled.div`
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 1rem;
  color: #475569;
`;

const NoticeTitle = styled.p`
  margin: 0 0 0.5rem;
  font-weight: 900;
  color: #0f172a;
`;

const NoticeText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
`;

type SourceDocumentsWorkspaceProps = {
  query: string;
  selectedFileName?: string;
  onQueryChange: (value: string) => void;
  onFileSelect: (file: File) => void;
};

export function SourceDocumentsWorkspace({ selectedFileName, onFileSelect }: SourceDocumentsWorkspaceProps) {
  const [documents, setDocuments] = useState<SourceDocumentRow[]>(MOCK_DOCUMENTS);
  const [keywordFilter, setKeywordFilter] = useState("전체");
  const [documentNoFilter, setDocumentNoFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const keywordOptions = useMemo(() => {
    const values = documents.flatMap((doc) => doc.keyword.split(",").map((keyword) => keyword.trim())).filter(Boolean);
    return ["전체", ...Array.from(new Set(values))];
  }, [documents]);

  const documentNoOptions = useMemo(() => ["전체", ...documents.map((doc) => doc.documentNo)], [documents]);

  const rows = documents.filter((doc) => {
    const keywordMatched = keywordFilter === "전체" || doc.keyword.includes(keywordFilter);
    const documentNoMatched = documentNoFilter === "전체" || doc.documentNo === documentNoFilter;
    return keywordMatched && documentNoMatched;
  });

  function handleUpload(file: File) {
    onFileSelect(file);

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
    const nextNo = `UPLOAD-${String(documents.length + 1).padStart(3, "0")}`;

    setDocuments((prev) => [
      {
        id: `uploaded-${Date.now()}`,
        doctrineName: baseName,
        keyword: `업로드, ${extension}, 교범`,
        documentNo: nextNo,
        status: "업로드 완료",
      },
      ...prev,
    ]);
    setKeywordFilter("전체");
    setDocumentNoFilter("전체");
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageStartIndex = (currentPage - 1) * pageSize;
  const pagedRows = rows.slice(pageStartIndex, pageStartIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [keywordFilter, documentNoFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <Section>
      <Stack>
        <Header>
          <Title>출처 문서</Title>
          <Description>교범명, 키워드, 문서번호 기준으로 출처 문서를 관리하고 hwp, docx, pdf 파일을 업로드합니다.</Description>
        </Header>

        <FilterCard aria-label="출처 문서 필터">
          <FilterField>
            키워드 필터
            <Select value={keywordFilter} onChange={(event) => setKeywordFilter(event.target.value)}>
              {keywordOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </FilterField>
          <FilterField>
            문서번호 필터
            <Select value={documentNoFilter} onChange={(event) => setDocumentNoFilter(event.target.value)}>
              {documentNoOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </FilterField>
        </FilterCard>

        {rows.length === 0 ? (
          <EmptyCard>선택한 필터와 일치하는 출처 문서가 없습니다.</EmptyCard>
        ) : (
          <TableCard>
            <Table>
              <thead>
                <tr>
                  <Th>교범명</Th>
                  <Th>키워드</Th>
                  <Th>문서번호</Th>
                  <Th>상태</Th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((doc) => (
                  <tr key={doc.id}>
                    <Td><DocTitle>{doc.doctrineName}</DocTitle></Td>
                    <Td>{doc.keyword}</Td>
                    <Td><Badge>{doc.documentNo}</Badge></Td>
                    <Td><Status>{doc.status}</Status></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <TableFooter>
              <PageInfo>
                총 {rows.length}개 / {currentPage} of {totalPages} 페이지 · 페이지당 10개
              </PageInfo>
              <Pagination aria-label="출처 문서 페이지 이동">
                <PageButton type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                  이전
                </PageButton>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <PageButton key={page} type="button" $active={page === currentPage} onClick={() => setCurrentPage(page)}>
                    {page}
                  </PageButton>
                ))}
                <PageButton type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                  다음
                </PageButton>
              </Pagination>
            </TableFooter>
          </TableCard>
        )}

        <UploadSection>
          <SectionTitle>교범 업로드</SectionTitle>
          <UploadDropzone selectedFileName={selectedFileName} onFileSelect={handleUpload} />
        </UploadSection>

        <Notice>
          <NoticeTitle>업로드 후 처리 예정</NoticeTitle>
          <NoticeText>
            업로드한 파일은 현재 화면의 교범 목록에 즉시 추가됩니다. 이후 파일 저장, 텍스트 추출, 청킹, 임베딩, 벡터 DB 인덱싱 API와 연결하면 됩니다.
          </NoticeText>
        </Notice>
      </Stack>
    </Section>
  );
}
