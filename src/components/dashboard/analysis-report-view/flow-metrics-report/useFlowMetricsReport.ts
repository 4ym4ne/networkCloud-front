"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EChartsOption } from "echarts";

export interface FlowMetricsResponse {
  id?: string;
  srcIp: string;
  dstIp: string;
  srcPort?: number | null;
  dstPort?: number | null;
  protocol?: string | null;
  throughputMbps?: number | null;
  loss?: number | null;
  rtt?: number | null;
  jitter?: number | null;
  mos?: number | null;
  quality?: string | null;
}

export type MetricDefinition = {
  key: string;
  label: string;
  accessor: (flow: FlowMetricsResponse) => number;
  format: (value: number) => string;
  higherIsBetter: boolean;
};

export type MetricSummary = {
  metricIndex: number;
  label: string;
  empty: boolean;
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  q1: number;
  q3: number;
  p95: number;
  bestFlow: FlowMetricsResponse | null;
  bestValue: number;
  worstFlow: FlowMetricsResponse | null;
  worstValue: number;
};

type ChartPoint = {
  index: number;
  value: number | null;
  actual: number | null;
  flow: FlowMetricsResponse;
};

type NormalizedSeries = {
  name: string;
  label: string;
  color: string;
  gradient: [string, string];
  format: (value: number) => string;
  points: ChartPoint[];
};

export const FLOWS_PER_PAGE = 50;

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    key: "throughput",
    label: "Throughput (Mbps)",
    accessor: (flow) => toNumber(flow.throughputMbps),
    format: (value) => `${value.toFixed(2)} Mbps`,
    higherIsBetter: true,
  },
  {
    key: "loss",
    label: "Loss (%)",
    accessor: (flow) => toPercent(flow.loss),
    format: (value) => `${value.toFixed(2)}%`,
    higherIsBetter: false,
  },
  {
    key: "rtt",
    label: "RTT (ms)",
    accessor: (flow) => toNumber(flow.rtt),
    format: (value) => `${value.toFixed(1)} ms`,
    higherIsBetter: false,
  },
  {
    key: "jitter",
    label: "Jitter (ms)",
    accessor: (flow) => toNumber(flow.jitter),
    format: (value) => `${value.toFixed(1)} ms`,
    higherIsBetter: false,
  },
  {
    key: "mos",
    label: "MOS",
    accessor: (flow) => Math.max(0, Math.min(4.5, toNumber(flow.mos))),
    format: (value) => (value <= 0 ? "–" : value.toFixed(2)),
    higherIsBetter: true,
  },
];

const SERIES_STYLES: Array<{ color: string; gradient: [string, string] }> = [
  {
    color: "#2563eb",
    gradient: ["rgba(37, 99, 235, 0.28)", "rgba(37, 99, 235, 0.04)"],
  },
  {
    color: "#22c55e",
    gradient: ["rgba(34, 197, 94, 0.28)", "rgba(34, 197, 94, 0.04)"],
  },
  {
    color: "#f97316",
    gradient: ["rgba(249, 115, 22, 0.28)", "rgba(249, 115, 22, 0.04)"],
  },
  {
    color: "#a855f7",
    gradient: ["rgba(168, 85, 247, 0.28)", "rgba(168, 85, 247, 0.04)"],
  },
  {
    color: "#0ea5e9",
    gradient: ["rgba(14, 165, 233, 0.28)", "rgba(14, 165, 233, 0.04)"],
  },
];

type UseFlowMetricsReportResult = {
  hasFlows: boolean;
  flowCount: number;
  chartOption: EChartsOption | null;
  summaries: MetricSummary[];
  showPagination: boolean;
  rangeStart: number;
  rangeEnd: number;
  clampedPage: number;
  totalPages: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  handlePrev: () => void;
  handleNext: () => void;
};

export function useFlowMetricsReport(
  flows: FlowMetricsResponse[] | null | undefined,
): UseFlowMetricsReportResult {
  const flowList = useMemo(
    () => (flows ?? []).filter((flow): flow is FlowMetricsResponse => Boolean(flow)),
    [flows],
  );

  const flowCount = flowList.length;

  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(flowCount / FLOWS_PER_PAGE)),
    [flowCount],
  );

  const clampedPage = Math.min(currentPage, Math.max(totalPages - 1, 0));

  useEffect(() => {
    if (clampedPage !== currentPage) {
      setCurrentPage(clampedPage);
    }
  }, [clampedPage, currentPage]);

  const pageStart = clampedPage * FLOWS_PER_PAGE;
  const pageEnd = Math.min(pageStart + FLOWS_PER_PAGE, flowCount);

  const visibleFlows = useMemo(() => {
    if (flowCount === 0) return [];
    return flowList.slice(pageStart, pageEnd);
  }, [flowList, flowCount, pageEnd, pageStart]);

  const showPagination = flowCount > FLOWS_PER_PAGE;
  const rangeStart = flowCount === 0 ? 0 : pageStart + 1;
  const rangeEnd = flowCount === 0 ? 0 : pageEnd;
  const canGoPrev = clampedPage > 0;
  const canGoNext = clampedPage < totalPages - 1;

  const handlePrev = useCallback(() => {
    if (!canGoPrev) return;
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, [canGoPrev]);

  const handleNext = useCallback(() => {
    if (!canGoNext) return;
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [canGoNext, totalPages]);

  const summaries = useMemo(
    () => METRIC_DEFINITIONS.map((metric, index) => summariseMetric(metric, index, visibleFlows)),
    [visibleFlows],
  );

  const normalizedSeries = useMemo(
    () => buildNormalizedSeries(visibleFlows),
    [visibleFlows],
  );

  const chartOption = useMemo((): EChartsOption | null => {
    if (normalizedSeries.length === 0) return null;

    return {
      grid: {
        left: 70,
        right: 40,
        top: 70,
        bottom: 110,
      },
      legend: {
        bottom: 30,
        icon: "circle",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line" },
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        textStyle: { color: "#f8fafc" },
        formatter: (params: unknown) => {
          const points = Array.isArray(params) ? params : [params];
          if (!points.length) return "—";
          const dataIndex = (points[0] as { dataIndex?: number }).dataIndex ?? 0;
          const flow = normalizedSeries[0]?.points[dataIndex]?.flow;
          if (!flow) return "—";

          const lines = [
            `<div><strong>${formatFullFlow(flow)}</strong></div>`,
            `<div>From: ${flow.srcIp ?? "unknown"}</div>`,
            `<div>To: ${flow.dstIp ?? "unknown"}</div>`,
            "<hr />",
          ];

          points.forEach((point) => {
            const { seriesName, dataIndex: idx } = point as {
              seriesName?: string;
              dataIndex?: number;
            };
            const series = normalizedSeries.find((entry) => entry.name === seriesName);
            const metricPoint = series?.points[idx ?? 0];
            if (
              series &&
              metricPoint &&
              Number.isFinite(metricPoint.actual ?? NaN) &&
              Number.isFinite(metricPoint.value ?? NaN)
            ) {
              lines.push(
                `<div>${series.label}: ${series.format(metricPoint.actual as number)} (normalized ${((metricPoint.value ?? 0) * 100).toFixed(0)}%)</div>`,
              );
            }
          });

          return lines.join("");
        },
      },
      xAxis: {
        type: "category",
        data:
          normalizedSeries[0]?.points.map((point) => String(pageStart + point.index + 1)) ?? [],
        axisLabel: {
          interval: 0,
          fontSize: 11,
        },
        axisLine: {
          lineStyle: { color: "rgba(148, 163, 184, 0.45)" },
        },
      },
      yAxis: {
        type: "value",
        nameLocation: "middle",
        nameGap: 60,
        axisLabel: {
          formatter: (value: number) => `${Math.round(value * 100)}%`,
        },
        splitLine: {
          lineStyle: { type: "dashed", color: "rgba(148, 163, 184, 0.25)" },
        },
      },
      series: normalizedSeries.map((series) => ({
        name: series.name,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        connectNulls: false,
        itemStyle: { color: series.color },
        lineStyle: { width: 2, color: series.color },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: series.gradient[0] },
              { offset: 1, color: series.gradient[1] },
            ],
          },
        },
        emphasis: {
          focus: "series",
          itemStyle: { scale: 1.1 },
        },
        data: series.points,
      })),
    };
  }, [normalizedSeries, pageStart]);

  return {
    hasFlows: flowCount > 0,
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
  };
}

export function formatMetricValue(metricIndex: number, value: number) {
  if (!Number.isFinite(value)) return "–";
  return METRIC_DEFINITIONS[metricIndex]?.format(value) ?? value.toFixed(2);
}

export function formatFullFlow(flow: FlowMetricsResponse) {
  const srcSuffix = formatEndpointSuffix(flow.srcIp);
  const dstSuffix = formatEndpointSuffix(flow.dstIp);
  const srcPort = flow.srcPort ?? "—";
  const dstPort = flow.dstPort ?? "—";
  const proto = flow.protocol ? flow.protocol.toUpperCase() : "N/A";
  return `${srcSuffix}:${srcPort} -> ${dstSuffix}:${dstPort} (${proto})`;
}

function summariseMetric(
  metric: MetricDefinition,
  metricIndex: number,
  flows: FlowMetricsResponse[],
): MetricSummary {
  const values = flows
    .map((flow) => metric.accessor(flow))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return {
      metricIndex,
      label: metric.label,
      empty: true,
      count: 0,
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      q1: 0,
      q3: 0,
      p95: 0,
      bestFlow: null,
      bestValue: 0,
      worstFlow: null,
      worstValue: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  const median = quantile(sorted, 0.5);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const p95 = quantile(sorted, 0.95);

  const bestValue = metric.higherIsBetter ? max : min;
  const worstValue = metric.higherIsBetter ? min : max;

  return {
    metricIndex,
    label: metric.label,
    empty: false,
    count: values.length,
    min,
    max,
    mean,
    median,
    q1,
    q3,
    p95,
    bestFlow: flows.find((flow) => metric.accessor(flow) === bestValue) ?? null,
    bestValue,
    worstFlow: flows.find((flow) => metric.accessor(flow) === worstValue) ?? null,
    worstValue,
  };
}

function buildNormalizedSeries(flows: FlowMetricsResponse[]): NormalizedSeries[] {
  if (flows.length === 0) return [];

  return METRIC_DEFINITIONS.map((metric, index) => {
    const points: ChartPoint[] = [];
    let min = Infinity;
    let max = -Infinity;

    flows.forEach((flow, flowIndex) => {
      const actual = metric.accessor(flow);
      if (!Number.isFinite(actual)) {
        points.push({ index: flowIndex, value: null, actual: null, flow });
        return;
      }
      min = Math.min(min, actual);
      max = Math.max(max, actual);
      points.push({ index: flowIndex, value: 0, actual, flow });
    });

    if (!points.some((point) => Number.isFinite(point.actual ?? NaN))) {
      return null;
    }

    const span = max - min;
    points.forEach((point) => {
      if (!Number.isFinite(point.actual ?? NaN)) {
        point.value = null;
      } else if (span === 0) {
        point.value = 0.5;
      } else {
        point.value = ((point.actual as number) - min) / span;
      }
    });

    const { color, gradient } = SERIES_STYLES[index % SERIES_STYLES.length];

    return {
      name: metric.label.split(" ")[0],
      label: metric.label,
      color,
      gradient,
      format: metric.format,
      points,
    };
  }).filter(isNotNull);
}

function quantile(sortedValues: number[], q: number) {
  if (sortedValues.length === 0) return 0;
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedValues[base + 1] !== undefined) {
    return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  }
  return sortedValues[base];
}

function formatEndpointSuffix(value: string) {
  if (!value) return "**??";
  const digits = value.replace(/\D+/g, "");
  const suffix = digits.slice(-2);
  if (suffix) return `**${suffix.padStart(2, "0")}`;
  const trimmed = value.trim();
  return trimmed.length >= 2 ? `**${trimmed.slice(-2)}` : `**${trimmed}`;
}

function toNumber(value: number | null | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toPercent(value: number | null | undefined) {
  const numeric = toNumber(value);
  return numeric <= 1 ? numeric * 100 : numeric;
}

function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
