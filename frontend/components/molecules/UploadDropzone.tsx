"use client";

import { Icon } from "@/components/atoms/Icon";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import styled from "styled-components";

const Box = styled.div<{ $dragging: boolean }>`
  border-radius: 1rem;
  border: 1.5px dashed ${({ $dragging }) => ($dragging ? "#2563eb" : "#cbd5e1")};
  background: ${({ $dragging }) => ($dragging ? "#eff6ff" : "#f8fafc")};
  padding: 1.5rem;
  text-align: center;
  transition: 0.16s ease;
`;

const IconBox = styled.div`
  margin: 0 auto 0.75rem;
  display: flex;
  height: 3rem;
  width: 3rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #dbeafe;
  color: #1d4ed8;
`;

const Title = styled.p`
  margin: 0;
  font-weight: 800;
  color: #0f172a;
`;

const Text = styled.p`
  margin: 0.375rem 0 1rem;
  font-size: 0.875rem;
  color: #64748b;
`;

const Button = styled.button`
  border: none;
  border-radius: 0.75rem;
  background: #1d4ed8;
  padding: 0.75rem 1rem;
  font-weight: 800;
  color: #fff;
  cursor: pointer;

  &:hover {
    background: #1e40af;
  }
`;

const FileName = styled.p`
  margin: 1rem 0 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e3a8a;
`;

const HiddenInput = styled.input`
  display: none;
`;

type UploadDropzoneProps = {
  selectedFileName?: string;
  onFileSelect: (file: File) => void;
};

export function UploadDropzone({ selectedFileName, onFileSelect }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    onFileSelect(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <Box
      $dragging={dragging}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <IconBox>
        <Icon name="upload" size={26} />
      </IconBox>
      <Title>교범 업로드</Title>
      <Text>hwp,docx,pdf 파일을 이 영역에 드래그하거나 버튼을 눌러 선택하세요.</Text>
      <HiddenInput ref={inputRef} type="file" accept="application/pdf,.pdf,.hwp,.doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword" onChange={handleChange} />
      <Button type="button" onClick={() => inputRef.current?.click()}>
        파일 선택
      </Button>
      {selectedFileName ? <FileName>선택된 파일: {selectedFileName}</FileName> : null}
    </Box>
  );
}
