"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Droplets,
  Gauge,
  ListChecks,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  Waves,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { formatDateTime, formatNumber, formatPercent } from "./formatters";
import type { AnalysisReport, LoadState as AnalysisLoadState } from "./types";
import type {
  SecurityReport,
  LoadState as SecurityLoadState,
} from "../security-report/types";

type PerformanceMetricDescriptor = {
  label: string;
  accessor: (report: AnalysisReport) => string;
  hint: string;
  icon: LucideIcon;
  accent: {
    gradient: string;
    icon: string;
  };
};

const PERFORMANCE_METRICS = [
  {
    label: "Total flows",
    accessor: (report: AnalysisReport) => formatNumber(report.totalFlows),
    hint: "Flows inspected during analysis.",
    icon: Activity,
    accent: {
      gradient: "from-emerald-500/60 via-emerald-500/15 to-transparent",
      icon: "text-emerald-500 dark:text-emerald-400",
    },
  },
  {
    label: "Average RTT",
    accessor: (report: AnalysisReport) => `${formatNumber(report.avgRtt)} ms`,
    hint: "Mean round-trip latency.",
    icon: Timer,
    accent: {
      gradient: "from-sky-500/60 via-sky-500/15 to-transparent",
      icon: "text-sky-500 dark:text-sky-400",
    },
  },
  {
    label: "Average loss",
    accessor: (report: AnalysisReport) => formatPercent(report.avgLoss),
    hint: "Packet loss across flows.",
    icon: Droplets,
    accent: {
      gradient: "from-rose-500/60 via-rose-500/15 to-transparent",
      icon: "text-rose-500 dark:text-rose-400",
    },
  },
  {
    label: "Average jitter",
    accessor: (report: AnalysisReport) => `${formatNumber(report.avgJitter)} ms`,
    hint: "Inter-packet delay variance.",
    icon: Waves,
    accent: {
      gradient: "from-violet-500/60 via-violet-500/15 to-transparent",
      icon: "text-violet-500 dark:text-violet-400",
    },
  },
  {
    label: "Average MOS",
    accessor: (report: AnalysisReport) => formatNumber(report.avgMos),
    hint: "Mean opinion score for call quality.",
    icon: Sparkles,
    accent: {
      gradient: "from-amber-500/60 via-amber-500/15 to-transparent",
      icon: "text-amber-500 dark:text-amber-400",
    },
  },
] satisfies ReadonlyArray<PerformanceMetricDescriptor>;

interface ReportOverviewCardProps {
  fileId: string | null | undefined;
  analysis: {
    report: AnalysisReport | null;
    status: AnalysisLoadState;
    error: string | null;
    onRetry: () => void;
    isRefreshing: boolean;
  };
  security: {
    report: SecurityReport | null;
    status: SecurityLoadState;
    error: string | null;
  };
}

export function ReportOverviewCard({
  fileId,
  analysis,
  security,
}: ReportOverviewCardProps) {
  if (!fileId) {
    return (
      <Card className="border border-dashed border-border/60 bg-muted/5">
        <CardHeader>
          <CardTitle className="text-2xl">Report overview</CardTitle>
          <CardDescription>
            Upload a PCAP to receive a file identifier and unlock analysis plus security verdicts.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Provide the generated file UUID to view combined insights for the capture session.
        </CardContent>
      </Card>
    );
  }

  const {
    report: analysisReport,
    status: analysisStatus,
    error: analysisError,
    onRetry,
    isRefreshing,
  } = analysis;
  const { report: securityReport, status: securityStatus, error: securityError } = security;

  const analysisLoading = analysisStatus === "loading" && !analysisReport;
  const analysisFailed = analysisStatus === "error" && !analysisReport;
  const riskAccent = securityReport ? getRiskAccent(securityReport.riskLevel) : null;

  return (
    <Card className="relative overflow-hidden border border-border/60">
      {riskAccent && (
        <span
          aria-hidden="true"
          className={cn("absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b", riskAccent.indicator)}
        />
      )}
      <CardHeader className="gap-6 pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                {fileId}
              </Badge>
              {analysisReport?.analyzedAt && (
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" aria-hidden="true" />
                  Analyzed {formatDateTime(analysisReport.analyzedAt)}
                </span>
              )}
              {securityReport?.generatedAt && (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  Verdict {formatDateTime(securityReport.generatedAt)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-2xl font-semibold text-foreground">Report overview</CardTitle>
              {analysisReport && (
                <Badge
                  variant={analysisReport.status === "FAILED" ? "destructive" : "secondary"}
                  className="flex items-center gap-1 uppercase tracking-wide"
                >
                  <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                  {analysisReport.status.toLowerCase()}
                </Badge>
              )}
              {analysisReport?.overallQuality && (
                <Badge variant="outline" className="flex items-center gap-1 uppercase tracking-wide">
                  <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                  {analysisReport.overallQuality}
                </Badge>
              )}
              {securityReport?.overallQuality && (
                <Badge variant="outline" className="flex items-center gap-1 uppercase tracking-wide">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {securityReport.overallQuality}
                </Badge>
              )}
            </div>

            <CardDescription className="max-w-xl text-sm leading-relaxed">
              Condensed performance metrics and security verdict generated for this capture session.
            </CardDescription>
          </div>

          <div className="flex flex-col items-start gap-3 text-sm md:items-end">
            <div className="flex flex-wrap justify-end gap-2 text-xs text-muted-foreground">
              {analysisStatus === "loading" && !analysisReport && (
                <Badge variant="outline" className="flex items-center gap-1 uppercase tracking-wide">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Analysis loading
                </Badge>
              )}
              {analysisStatus === "error" && !analysisReport && (
                <Badge variant="destructive" className="flex items-center gap-1 uppercase tracking-wide">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  Retry analysis
                </Badge>
              )}
              {securityStatus === "loading" && !securityReport && (
                <Badge variant="outline" className="flex items-center gap-1 uppercase tracking-wide">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Security loading
                </Badge>
              )}
              {securityStatus === "not_found" && (
                <Badge variant="outline" className="flex items-center gap-1 uppercase tracking-wide">
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  Verdict pending
                </Badge>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={onRetry}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Refreshing…
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Section
            title="Network performance"
            description="A compact snapshot of flows, latency, loss, and jitter gathered by the analyzer."
            className="h-full"
          >
            {analysisLoading ? (
              <PerformanceSkeleton />
            ) : analysisFailed ? (
              <AnalysisError message={analysisError} onRetry={onRetry} />
            ) : (
              <PerformanceGrid report={analysisReport} />
            )}
          </Section>

          <Section
            title="Security verdict"
            description="Risk scoring, analyzer status, and recommended next steps."
            className="h-full"
          >
            <SecurityPanel
              status={securityStatus}
              report={securityReport}
              riskAccent={riskAccent}
              error={securityError}
            />
          </Section>
        </div>
      </CardContent>

      {(analysisReport || securityReport) && (
        <footer className="flex flex-col gap-2 border-t border-border/60 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          {analysisReport ? (
            <span>
              Analysis ID: <span className="font-mono">{analysisReport.reportId}</span>
            </span>
          ) : (
            <span />
          )}
          {securityReport && (
            <span>
              Security ID: <span className="font-mono">{securityReport.id}</span>
            </span>
          )}
        </footer>
      )}
    </Card>
  );
}

function Section({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function PerformanceGrid({ report }: { report: AnalysisReport | null }) {
  if (!report) {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 text-xs text-muted-foreground">
        Analysis metrics will appear once processing completes.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {PERFORMANCE_METRICS.map((metric) => (
        <PerformanceMetricCard key={metric.label} metric={metric} report={report} />
      ))}
    </div>
  );
}

function PerformanceMetricCard({
  metric,
  report,
}: {
  metric: PerformanceMetricDescriptor;
  report: AnalysisReport;
}) {
  const Icon = metric.icon;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/90 p-4 shadow-sm transition hover:-translate-y-[2px] hover:border-primary/40 hover:shadow-lg">
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r", metric.accent.gradient)}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            {metric.label}
          </p>
          <p className="mt-2 text-xl font-semibold text-foreground">{metric.accessor(report)}</p>
        </div>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition group-hover:bg-primary/10",
            metric.accent.icon,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{metric.hint}</p>
    </div>
  );
}

function SecurityPanel({
  status,
  report,
  riskAccent,
  error,
}: {
  status: SecurityLoadState;
  report: SecurityReport | null;
  riskAccent: ReturnType<typeof getRiskAccent> | null;
  error: string | null;
}) {
  if (status === "loading" && !report) {
    return (
      <div className="space-y-4 rounded-2xl border border-border/60 bg-background/80 p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-5 text-sm text-muted-foreground">
        No security verdict has been generated for this capture yet.
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-5 text-sm text-muted-foreground">
        Security information is unavailable.
      </div>
    );
  }

  const progressValue = Number.isFinite(Number(report.riskScore))
    ? Math.min(Math.max(Number(report.riskScore), 0), 100)
    : 0;
  const defaultTab = report.summary ? "summary" : "recommendations";

  return (
    <div
      className={cn(
        "relative space-y-5 overflow-hidden rounded-2xl border border-border/60 bg-background/85 p-5 shadow-sm backdrop-blur-sm",
        riskAccent?.panel,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn("flex items-center gap-1 uppercase tracking-wide", riskAccent?.badge)}>
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Risk {report.riskLevel}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1 uppercase tracking-wide">
          <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
          Score {formatNumber(report.riskScore)}
        </Badge>
        {report.overallQuality && (
          <Badge variant="outline" className="flex items-center gap-1 uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {report.overallQuality}
          </Badge>
        )}
      </div>

      <div className="rounded-xl border border-border/50 bg-background/80 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
          <span>Analyzer status</span>
          <span className="flex items-center gap-1 text-foreground">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            {report.analysisStatus}
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <Progress value={progressValue} className="bg-muted/40" />
          <p className="text-xs text-muted-foreground">
            Higher values indicate elevated risk exposure.
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="gap-3">
        <TabsList>
          <TabsTrigger value="summary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            Actions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <SecurityDetailCard title="Executive summary" icon={Sparkles}>
            {report.summary ? (
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                {report.summary}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No summary provided.</p>
            )}
          </SecurityDetailCard>
        </TabsContent>
        <TabsContent value="recommendations">
          <SecurityDetailCard title="Recommended actions" icon={ListChecks}>
            {report.recommendations && report.recommendations.length > 0 ? (
              <ul className="space-y-2 text-sm leading-relaxed text-foreground">
                {report.recommendations.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-primary"
                    />
                    <span className="whitespace-pre-line">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No recommendations provided.</p>
            )}
          </SecurityDetailCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SecurityDetailCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/50 bg-background/80 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{title}</span>
      </div>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

function PerformanceSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: PERFORMANCE_METRICS.length }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-2xl border border-border/50 bg-background/80 p-4">
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function AnalysisError({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
      <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      <div className="flex-1 text-sm">{message ?? "Unable to load analysis metrics."}</div>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

type RiskAccent = {
  badge: string;
  indicator: string;
  panel: string;
};

function getRiskAccent(riskLevel: string): RiskAccent {
  const key = riskLevel?.toLowerCase() ?? "";
  if (key.includes("critical") || key.includes("high")) {
    return {
      badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
      indicator: "from-rose-500/80 via-rose-500/30 to-transparent",
      panel: "border-rose-500/40 bg-rose-500/5",
    };
  }
  if (key.includes("elevated") || key.includes("medium")) {
    return {
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
      indicator: "from-amber-500/70 via-amber-500/25 to-transparent",
      panel: "border-amber-500/40 bg-amber-500/5",
    };
  }
  if (key.includes("low") || key.includes("minimal")) {
    return {
      badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
      indicator: "from-emerald-500/70 via-emerald-500/25 to-transparent",
      panel: "border-emerald-500/30 bg-emerald-500/5",
    };
  }
  return {
    badge: "bg-muted text-muted-foreground border border-border/60",
    indicator: "from-muted-foreground/40 via-muted-foreground/10 to-transparent",
    panel: "",
  };
}
