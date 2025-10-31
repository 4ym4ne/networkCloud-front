export type AnalyzedFileRecord = {
  fileId: string;
  fileName?: string;
  status?: string;
  uploadedAt?: string | null;
  analyzedAt?: string | null;
  totalFlows?: number | null;
  overallQuality?: string | null;
  sizeBytes?: number | null;
  reportId?: string | null;
};

export type LoadState = "idle" | "loading" | "success" | "error";

export type AnalyzedFilePage = {
  content: AnalyzedFileRecord[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};
