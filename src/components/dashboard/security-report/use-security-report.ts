import { useEffect, useMemo, useState } from "react";

import type { LoadState, SecurityReport } from "./types";

function sanitizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

interface UseSecurityReportParams {
  fileId?: string | null;
  analyzerBaseUrl?: string;
}

export function useSecurityReport({ fileId, analyzerBaseUrl }: UseSecurityReportParams) {
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [status, setStatus] = useState<LoadState>(fileId ? "loading" : "idle");
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const endpoint = analyzerHost
      ? `${analyzerHost}/api/security-reports/${encodeURIComponent(fileId)}`
      : `/api/security-reports/${encodeURIComponent(fileId)}`;

    async function fetchReport() {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (response.status === 404) {
          if (!cancelled) {
            setReport(null);
            setStatus("not_found");
          }
          return;
        }

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Security report request failed (${response.status})`);
        }

        const payload = (await response.json()) as Record<string, any>;
        if (cancelled) return;

        setReport(normalizeSecurityReport(payload));
        setStatus("success");
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setReport(null);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to load security report.");
      }
    }

    void fetchReport();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [fileId, analyzerHost]);

  return {
    report,
    status,
    error,
  } as const;
}

function normalizeSecurityReport(raw: Record<string, any>): SecurityReport {
  const getString = (value: any) => (typeof value === "string" ? value : undefined);
  const getNumber = (value: any) => (typeof value === "number" ? value : undefined);
  const getStringArray = (value: any) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : undefined;

  const generatedId = (() => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `temp-${Date.now()}`;
  })();

  return {
    id: getString(raw.id) ?? getString(raw.reportId) ?? generatedId,
    fileId: getString(raw.fileId) ?? getString(raw.file_id) ?? "unknown",
    analysisReportId:
      getString(raw.analysisReportId) ?? getString(raw.analysis_report_id) ?? "unknown",
    generatedAt:
      getString(raw.generatedAt) ?? getString(raw.generated_at) ?? new Date().toISOString(),
    riskScore: getNumber(raw.riskScore) ?? getNumber(raw.risk_score) ?? 0,
    riskLevel: getString(raw.riskLevel) ?? getString(raw.risk_level) ?? "unknown",
    analysisStatus:
      getString(raw.analysisStatus) ?? getString(raw.analysis_status) ?? "unknown",
    overallQuality:
      getString(raw.overallQuality) ?? getString(raw.overall_quality) ?? undefined,
    summary: getString(raw.summary) ?? undefined,
    recommendations:
      getStringArray(raw.recommendations) ??
      getStringArray(raw.recommendationList) ??
      (getString(raw.recommendations) ? [getString(raw.recommendations)!] : undefined),
    totalFlows: getNumber(raw.totalFlows) ?? getNumber(raw.total_flows) ?? undefined,
    avgRtt: getNumber(raw.avgRtt) ?? getNumber(raw.avg_rtt) ?? undefined,
    avgLoss: getNumber(raw.avgLoss) ?? getNumber(raw.avg_loss) ?? undefined,
    avgJitter: getNumber(raw.avgJitter) ?? getNumber(raw.avg_jitter) ?? undefined,
    avgMos: getNumber(raw.avgMos) ?? getNumber(raw.avg_mos) ?? undefined,
  };
}
