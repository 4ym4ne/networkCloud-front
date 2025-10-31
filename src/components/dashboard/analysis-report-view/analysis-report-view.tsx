"use client";

import { cn } from "@/lib/utils";

import { FlowTable } from "./flow-table";
import { FlowMetricsReport } from "./flow-metrics-report";
import { useAnalysisReport } from "./use-analysis-report";
import { ReportOverviewCard } from "./report-overview-card";
import { useSecurityReport } from "../security-report/use-security-report";

export interface AnalysisReportViewProps {
  fileId: string | null | undefined;
  analyzerBaseUrl?: string;
  className?: string;
  defaultPageSize?: number;
}

export function AnalysisReportView({
  fileId,
  analyzerBaseUrl,
  className,
  defaultPageSize,
}: AnalysisReportViewProps) {
  const { report, status, error, refresh } = useAnalysisReport({
    fileId,
    analyzerBaseUrl,
  });
  const security = useSecurityReport({ fileId, analyzerBaseUrl });

  const isLoading = status === "loading";

  const overviewCard = (
    <ReportOverviewCard
      fileId={fileId}
      analysis={{
        report,
        status,
        error,
        onRetry: refresh,
        isRefreshing: isLoading,
      }}
      security={security}
    />
  );

  if (!fileId) {
    return <div className={cn("space-y-6", className)}>{overviewCard}</div>;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {overviewCard}

      <FlowMetricsReport flows={report?.flows} />

      <FlowTable
        flows={report?.flows ?? null}
        status={status}
        error={error}
        onRetry={refresh}
        defaultPageSize={defaultPageSize}
      />
    </div>
  );
}
