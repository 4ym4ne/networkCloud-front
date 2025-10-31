import { useCallback, useEffect, useState } from "react";

import type { AnalyzedFileRecord, LoadState } from "./types";
import { fetchAnalyzedFiles } from "@/core/services/analysis";

interface UseAnalyzedFilesParams {
  analyzerBaseUrl?: string;
  page?: number;
  size?: number;
}

export function useAnalyzedFiles({ analyzerBaseUrl, page: initialPage = 0, size: initialSize = 15 }: UseAnalyzedFilesParams = {}) {
  const [records, setRecords] = useState<AnalyzedFileRecord[]>([]);
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [remotePage, setRemotePage] = useState<{
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  } | null>(null);

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const effectiveBaseUrl = analyzerBaseUrl ?? process.env.NEXT_PUBLIC_ANALYZER_BASE_URL;

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchFiles() {
      setStatus("loading");
      setError(null);

      try {
        const result = await fetchAnalyzedFiles({
          page,
          size,
          analyzerBaseUrl: effectiveBaseUrl,
          signal: controller.signal,
        });
        if (cancelled) return;

        setRecords(result.records);
        if (result.page !== page) {
          setPage(result.page);
        }
        if (result.size !== size) {
          setSize(result.size);
        }
        setRemotePage({
          page: result.page,
          size: result.size,
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          last: result.last,
        });
        setStatus("success");
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setStatus("error");
        setRecords([]);
        setRemotePage(null);
        setError(err instanceof Error ? err.message : "Failed to list analyzed files.");
      }
    }

    void fetchFiles();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [effectiveBaseUrl, refreshToken, page, size]);

  const refresh = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  return {
    records,
    status,
    error,
    refresh,
    remotePage,
    page,
    size,
    setPage,
    setSize,
  } as const;
}
