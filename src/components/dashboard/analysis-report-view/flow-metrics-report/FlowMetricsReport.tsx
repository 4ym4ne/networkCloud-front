"use client";

import type { CSSProperties, ComponentType } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  METRIC_DEFINITIONS,
  type MetricSummary,
  type FlowMetricsResponse,
  formatFullFlow,
  formatMetricValue,
  useFlowMetricsReport,
} from "./useFlowMetricsReport";

interface ReactEChartsProps {
  option: EChartsOption;
  style?: CSSProperties;
  notMerge?: boolean;
  lazyUpdate?: boolean;
}

const ReactGradientLine = dynamic(
  async () => {
    const mod = await import("echarts-for-react");
    return mod.default;
  },
  { ssr: false },
) as ComponentType<ReactEChartsProps>;

export interface FlowMetricsReportProps {
  flows: FlowMetricsResponse[] | null | undefined;
  className?: string;
}

export function FlowMetricsReport({ flows, className }: FlowMetricsReportProps) {
  const {
    hasFlows,
    flowCount,
    chartOption,
    summaries,
    showPagination,
    rangeStart,
    rangeEnd,
    clampedPage,
    totalPages,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  } = useFlowMetricsReport(flows);

  if (!hasFlows) {
    return (
      <Card className={cn("border border-border/50", className)}>
        <CardHeader>
          <CardTitle className="text-base">Flow Metrics</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Metrics visualizations become available once analyzer flow data is present.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border border-border/50">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="uppercase tracking-wide">
                Live Analyzer
              </Badge>
              <Badge variant="outline">Flow Metrics</Badge>
            </div>
            <CardTitle className="text-xl font-semibold">Flow Health Timeline</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Review throughput, loss, latency, jitter, and MOS for each captured flow; hover points
              for exact values and endpoints.
            </CardDescription>
          </div>
          <div className="text-xs text-muted-foreground sm:text-right">
            <span className="font-medium text-foreground">{flowCount}</span> total flows
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {showPagination && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="text-muted-foreground">
                Showing flows {rangeStart} – {rangeEnd} of {flowCount}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrev} disabled={!canGoPrev}>
                  Previous
                </Button>
                <span className="text-muted-foreground">
                  Page {clampedPage + 1} of {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={handleNext} disabled={!canGoNext}>
                  Next
                </Button>
              </div>
            </div>
          )}
          {chartOption ? (
            <ReactGradientLine option={chartOption} style={{ height: 420 }} notMerge lazyUpdate />
          ) : (
            <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
              Not enough data to plot metrics.
            </div>
          )}

          <div className="mt-6 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
            {summaries.map((summary) => (
              <MetricSnapshot key={summary.metricIndex} summary={summary} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricSnapshot({ summary }: { summary: MetricSummary }) {
  const metric = METRIC_DEFINITIONS[summary.metricIndex];

  if (summary.empty) {
    return (
      <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-xs">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {metric.label}
        </p>
        <p className="text-muted-foreground">No flow data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border/60 bg-muted/10 p-4 text-xs">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {metric.label} Snapshot
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SnapshotItem label="Median" summary={summary} value={summary.median} />
        <SnapshotItem
          label="Q1 – Q3"
          summary={summary}
          value={`${formatMetricValue(summary.metricIndex, summary.q1)} – ${formatMetricValue(summary.metricIndex, summary.q3)}`}
          custom
        />
        <SnapshotItem
          label="Range"
          summary={summary}
          value={`${formatMetricValue(summary.metricIndex, summary.min)} – ${formatMetricValue(summary.metricIndex, summary.max)}`}
          custom
        />
        <SnapshotItem label="Average" summary={summary} value={summary.mean} />
        <SnapshotItem label="P95" summary={summary} value={summary.p95} />
        <div>
          <p className="text-muted-foreground">Samples</p>
          <p className="text-sm font-semibold text-foreground">{summary.count}</p>
        </div>
      </div>
      <div className="space-y-2 text-xs">
        {summary.bestFlow && (
          <SnapshotBadge
            prefix={METRIC_DEFINITIONS[summary.metricIndex].higherIsBetter ? "Top flow" : "Lowest flow"}
            flow={summary.bestFlow}
            metricIndex={summary.metricIndex}
            value={summary.bestValue}
            variant="secondary"
          />
        )}
        {summary.worstFlow && (
          <SnapshotBadge
            prefix={METRIC_DEFINITIONS[summary.metricIndex].higherIsBetter ? "Lowest flow" : "Top flow"}
            flow={summary.worstFlow}
            metricIndex={summary.metricIndex}
            value={summary.worstValue}
            variant="outline"
          />
        )}
      </div>
    </div>
  );
}

function SnapshotItem({
  label,
  summary,
  value,
  custom,
}: {
  label: string;
  summary: MetricSummary;
  value: number | string;
  custom?: boolean;
}) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {custom ? (value as string) : formatMetricValue(summary.metricIndex, value as number)}
      </p>
    </div>
  );
}

function SnapshotBadge({
  prefix,
  flow,
  metricIndex,
  value,
  variant,
}: {
  prefix: string;
  flow: FlowMetricsResponse;
  metricIndex: number;
  value: number;
  variant: "secondary" | "outline";
}) {
  return (
    <p className="text-muted-foreground">
      <span className="font-semibold text-foreground">{prefix}:</span>{" "}
      {formatFullFlow(flow)}
      <Badge
        variant={variant}
        className="ml-1 inline-flex h-4 items-center rounded-full px-1.5 text-[10px]"
      >
        {formatMetricValue(metricIndex, value)}
      </Badge>
    </p>
  );
}
