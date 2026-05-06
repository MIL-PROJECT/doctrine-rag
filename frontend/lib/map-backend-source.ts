import type { BackendSource, ChatSourceRow } from "./types";

function slugFromFilename(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "").trim() || "document";
  return base.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_.\-가-힣]/g, "_").slice(0, 160) || "document";
}

export function mapBackendSourcesToRows(rows: BackendSource[]): ChatSourceRow[] {
  return rows.map((row, idx) => {
    const src = String(row.source ?? "unknown");
    const title = row.document_title ? String(row.document_title) : src;
    const preview = String(row.preview ?? "");
    const dist = row.distance;
    const scoreLabel =
      dist === null || dist === undefined
        ? "N/A"
        : typeof dist === "number"
          ? dist.toFixed(4)
          : String(dist);

    const pageParts: string[] = [];
    if (row.pdf_page_start != null && row.pdf_page_start !== "") pageParts.push(`p.${row.pdf_page_start}`);
    if (row.chapter) pageParts.push(`장 ${row.chapter}`);
    if (row.section) pageParts.push(row.section);
    if (row.chunk_index != null && row.chunk_index !== "") pageParts.push(`chunk ${row.chunk_index}`);
    const pageLabel = pageParts.length > 0 ? pageParts.join(" · ") : `chunk ${row.chunk_index ?? "—"}`;

    const docKey = row.document_id ? String(row.document_id) : src;

    return {
      rank: idx + 1,
      docId: slugFromFilename(docKey),
      title,
      year: "—",
      page: pageLabel,
      quote: preview.length > 280 ? `${preview.slice(0, 280)}…` : preview,
      score: scoreLabel,
    };
  });
}
