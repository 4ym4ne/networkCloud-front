import { useEffect, useMemo, useState } from "react";

import type { AnalysisReport, LoadState } from "./types";

function sanitizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

interface UseAnalysisReportParams {
  fileId?: string | null;
  analyzerBaseUrl?: string;
}

export function useAnalysisReport({ fileId, analyzerBaseUrl }: UseAnalysisReportParams) {
  const [status, setStatus] = useState<LoadState>(() => (fileId ? "loading" : "idle"));
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const analyzerHost = useMemo(() => {
    if (analyzerBaseUrl) return sanitizeBaseUrl(analyzerBaseUrl);
    if (process.env.NEXT_PUBLIC_ANALYZER_BASE_URL) {
      return sanitizeBaseUrl(process.env.NEXT_PUBLIC_ANALYZER_BASE_URL);
    }
    return null;
  }, [analyzerBaseUrl]);

  useEffect(() => {
    if (!fileId) {
      setReport(null);
      setStatus("idle");
      setError(null);
      return;
    }

    const controller = new AbortController();
    const endpoint = analyzerHost
      ? `${analyzerHost}/api/analysis/${encodeURIComponent(fileId)}`
      : `/api/analysis/${encodeURIComponent(fileId)}`;

    setStatus("loading");
    setError(null);

    const fetchReport = async () => {
      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Unable to load analysis report (status ${response.status}).`);
        }

        const payload = (await response.json()) as AnalysisReport;

        setReport(payload);
        setStatus("success");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setReport(null);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to load analysis report.");
      }
    };

    void fetchReport();

    return () => {
      controller.abort();
    };
  }, [fileId, analyzerHost, reloadKey]);

  const refresh = () => {
    setReloadKey((key) => key + 1);
  };

  return {
    status,
    report,
    error,
    refresh,
    analyzerBaseUrl: analyzerHost,
  } as const;
}
