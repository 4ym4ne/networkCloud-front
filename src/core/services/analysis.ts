import { apiRequest } from "@/core/http/api-client";
import type { AnalyzedFileRecord, AnalyzedFilePage } from "@/components/dashboard/analysis-history/types";

function sanitizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function normalizeRecord(raw: Record<string, any>): AnalyzedFileRecord | null {
  const fileId =
    raw.fileId ??
    raw.id ??
    raw.reportId ??
    raw.uploadId ??
    (typeof raw.reference === "string" ? raw.reference : null);

  if (!fileId || typeof fileId !== "string") return null;

  const fileName =
    raw.fileName ??
    raw.name ??
    raw.originalName ??
    (typeof raw.filename === "string" ? raw.filename : undefined);

  const status =
    typeof raw.status === "string"
      ? raw.status
      : typeof raw.latestStatus === "string"
      ? raw.latestStatus
      : undefined;
  const uploadedAt =
    typeof raw.uploadedAt === "string"
      ? raw.uploadedAt
      : typeof raw.createdAt === "string"
      ? raw.createdAt
      : undefined;
  const analyzedAt =
    typeof raw.analyzedAt === "string"
      ? raw.analyzedAt
      : typeof raw.completedAt === "string"
      ? raw.completedAt
      : undefined;
  const totalFlows =
    typeof raw.totalFlows === "number"
      ? raw.totalFlows
      : typeof raw.flowCount === "number"
      ? raw.flowCount
      : undefined;
  const overallQuality =
    typeof raw.overallQuality === "string"
      ? raw.overallQuality
      : typeof raw.quality === "string"
      ? raw.quality
      : undefined;
  const sizeBytes =
    typeof raw.sizeBytes === "number"
      ? raw.sizeBytes
      : typeof raw.size === "number"
      ? raw.size
      : undefined;

  return {
    fileId,
    fileName,
    status,
    uploadedAt: uploadedAt ?? null,
    analyzedAt: analyzedAt ?? null,
    totalFlows: totalFlows ?? null,
    overallQuality: overallQuality ?? null,
    sizeBytes: sizeBytes ?? null,
    reportId:
      typeof raw.reportId === "string"
        ? raw.reportId
        : typeof raw.reportID === "string"
        ? raw.reportID
        : undefined,
  };
}

export type FetchAnalyzedFilesParams = {
  page?: number;
  size?: number;
  analyzerBaseUrl?: string;
  signal?: AbortSignal;
};

export type FetchAnalyzedFilesResult = {
  records: AnalyzedFileRecord[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

function resolvePagePayload(payload: unknown, page: number, size: number): FetchAnalyzedFilesResult {
  let items: unknown[] = [];
  let resolvedPage = page;
  let resolvedSize = size;
  let totalElements = 0;
  let totalPages = 1;
  let isLast = true;

  if (Array.isArray(payload)) {
    items = payload;
    resolvedPage = 0;
    totalElements = payload.length;
    totalPages = 1;
    isLast = true;
  } else if (payload && typeof payload === "object") {
    const body = payload as Partial<AnalyzedFilePage>;
    items = Array.isArray(body.content) ? body.content : [];
    if (typeof body.page === "number") resolvedPage = body.page;
    if (typeof body.size === "number") resolvedSize = body.size;
    if (typeof body.totalElements === "number") totalElements = body.totalElements;
    if (typeof body.totalPages === "number") totalPages = body.totalPages;
    if (typeof body.last === "boolean") isLast = body.last;
  }

  const records = items
    .map((entry) => (entry && typeof entry === "object" ? normalizeRecord(entry as Record<string, unknown>) : null))
    .filter((entry): entry is AnalyzedFileRecord => entry !== null)
    .sort((a, b) => {
      const left = a.analyzedAt ?? a.uploadedAt ?? "";
      const right = b.analyzedAt ?? b.uploadedAt ?? "";
      return right.localeCompare(left);
    });

  const finalTotalElements = totalElements || records.length;
  const finalTotalPages = totalPages > 0 ? totalPages : records.length > 0 ? 1 : 0;
  const finalIsLast = totalPages > 0 ? isLast : true;

  return {
    records,
    page: resolvedPage,
    size: resolvedSize,
    totalElements: finalTotalElements,
    totalPages: finalTotalPages,
    last: finalIsLast,
  };
}

export async function fetchAnalyzedFiles({
  page = 0,
  size = 15,
  analyzerBaseUrl,
  signal,
}: FetchAnalyzedFilesParams = {}): Promise<FetchAnalyzedFilesResult> {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (analyzerBaseUrl) {
    const endpoint = `${sanitizeBaseUrl(analyzerBaseUrl)}/api/analysis/getAnalyzedFiles?${searchParams.toString()}`;
    const response = await fetch(endpoint, {
      signal,
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Listing failed with status ${response.status}.`);
    }

    const payload = await response.json();
    return resolvePagePayload(payload, page, size);
  }

  const payload = await apiRequest<unknown>(`/api/analysis/list?${searchParams.toString()}`, {
    method: "GET",
    signal,
  });
  return resolvePagePayload(payload, page, size);
}
