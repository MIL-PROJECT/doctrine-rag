import "./globals.css";

export const metadata = {
  title: "DoctrineRAG",
  description: "교리 문서 기반 RAG 챗봇"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
