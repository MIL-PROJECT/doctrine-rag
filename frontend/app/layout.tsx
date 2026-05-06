import type { Metadata } from "next";
import { StyledComponentsRegistry } from "@/components/StyledComponentsRegistry";
import "./globals.css";

export const metadata: Metadata = {
  title: "DoctrineRAG · Ollama",
  description: "로컬 Ollama + RAG 교리 Q&A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
