export type Conversation = {
  id: string;
  title: string;
  time: string;
  active?: boolean;
};

export type ChatSourceRow = {
  rank: number;
  docId: string;
  title: string;
  year: string;
  page: string;
  quote: string;
  score: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  time: string;
};

export type BackendSource = {
  source?: string | null;
  chunk_index?: number | string | null;
  distance?: number | null;
  preview?: string | null;
  document_title?: string | null;
  document_id?: string | null;
  chapter?: string | null;
  section?: string | null;
  pdf_page_start?: string | number | null;
  pdf_page_end?: string | number | null;
};

export type HealthPayload = {
  status?: string;
  chroma_documents?: number;
  ollama_reachable?: boolean;
  ollama_model?: string;
  ingest_flag?: boolean;
  ingest_mode?: string;
};

export type ChatApiResponse = {
  answer: string;
  citations?: BackendSource[];
  related_topics?: string[];
};
