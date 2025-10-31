"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, FileText, Loader2, MousePointerClick, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { AnalysisReportView } from "@/components/dashboard/analysis-report-view";
import {
  formatBytes,
  formatDateTime,
  formatNumber,
  integerFormatter,
} from "@/components/dashboard/analysis-report-view/formatters";

import { useAnalyzedFiles } from "./use-analyzed-files";
interface AnalysisHistoryProps {
  analyzerBaseUrl?: string;
  className?: string;
  detailBasePath?: string;
}

export function AnalysisHistory({
  analyzerBaseUrl,
  className,
  detailBasePath,
}: AnalysisHistoryProps) {
  const {
    records,
    status,
    error,
    refresh,
    remotePage,
    page,
    size,
    setPage,
  } = useAnalyzedFiles({ analyzerBaseUrl });
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const router = useRouter();

  const usesNavigation = Boolean(detailBasePath);

  const totalElements = remotePage?.totalElements ?? records.length;
  const totalPages = remotePage?.totalPages ?? (records.length ? 1 : 1);
  const currentPage = page + 1;
  const startIndex = totalElements && records.length ? page * size + 1 : 0;
  const endIndex = totalElements && records.length ? page * size + records.length : 0;

  const hasRecords = records.length > 0;
  const visibleRecords = records;

  useEffect(() => {
    if (usesNavigation) return;
    if (!visibleRecords.length) {
      setSelectedFileId(null);
      return;
    }

    if (!selectedFileId) {
      setSelectedFileId(visibleRecords[0]?.fileId ?? null);
      return;
    }

    const stillExists = visibleRecords.some((record) => record.fileId === selectedFileId);
    if (!stillExists) {
      setSelectedFileId(visibleRecords[0]?.fileId ?? null);
    }
  }, [visibleRecords, selectedFileId, usesNavigation]);

  const selectedRecord = useMemo(
    () =>
      usesNavigation
        ? null
        : visibleRecords.find((record) => record.fileId === selectedFileId) ?? null,
    [visibleRecords, selectedFileId, usesNavigation],
  );

  const isLoading = status === "loading";
  const isError = status === "error";

  const totalUploadsLabel = formatNumber(totalElements, integerFormatter);
  const latestTimestampLabel = useMemo(() => {
    const latest = records[0];
    if (!latest) return null;
    const label = formatDateTimeSafe(latest.analyzedAt ?? latest.uploadedAt);
    return label === "—" ? null : label;
  }, [records]);

  const navigateToRecord = (fileId: string) => {
    if (usesNavigation && detailBasePath) {
      const base = detailBasePath.endsWith("/")
        ? detailBasePath.slice(0, -1)
        : detailBasePath;
      router.push(`${base}/${encodeURIComponent(fileId)}`);
    } else {
      setSelectedFileId(fileId);
    }
  };

  const footerText = hasRecords
    ? `Showing ${formatNumber(startIndex, integerFormatter)}-${formatNumber(endIndex, integerFormatter)} of ${totalUploadsLabel} uploads.`
    : "Tip: Recent uploads appear first. Refresh to sync with the latest analyzer state.";

  return (
    <div className={cn("space-y-8", className)}>
      <Card className="border border-border/60">
        <CardHeader className="space-y-4 border-b border-border/60 pb-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Archive className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold">Captured uploads</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Review completed analyses and reopen their reports in a click.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <span className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="text-sm font-semibold text-foreground">{totalUploadsLabel}</span>
                <span>Total</span>
              </span>
              {latestTimestampLabel ? (
                <span className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                  <span>Updated</span>
                  <span className="font-medium text-foreground">{latestTimestampLabel}</span>
                </span>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={refresh}
                disabled={isLoading}
              >
                {isLoading ? (
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
        <CardContent className="space-y-5" aria-busy={isLoading} aria-live="polite">
          {isLoading && !hasRecords ? (
            <HistorySkeleton />
          ) : isError ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
              <span>{error ?? "Failed to load analysis history."}</span>
              <Button size="sm" variant="outline" onClick={refresh}>
                Retry
              </Button>
            </div>
          ) : hasRecords ? (
            <div className="overflow-hidden rounded-xl border border-border/40 bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[220px]">File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Analyzed</TableHead>
                    <TableHead className="text-right">Total flows</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRecords.map((record) => {
                    const isSelected = !usesNavigation && record.fileId === selectedFileId;
                    const displayName = record.fileName ?? record.fileId;
                    const fileExtension = getFileExtension(record.fileName);
                    return (
                      <TableRow
                        key={record.fileId}
                        data-selected={isSelected}
                        aria-selected={isSelected}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected
                            ? "bg-primary/10 text-foreground hover:bg-primary/15"
                            : "hover:bg-muted/50",
                        )}
                        onClick={() => navigateToRecord(record.fileId)}
                      >
                        <TableCell>
                          <div
                            className={cn(
                              "flex items-center gap-3 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 transition",
                              isSelected
                                ? "border-primary/40 bg-primary/10"
                                : "hover:border-border/60 hover:bg-muted/30",
                            )}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background/70 text-primary ring-1 ring-border/60">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate font-medium" title={displayName}>
                                  {displayName}
                                </span>
                                {fileExtension ? (
                                  <Badge
                                    variant="secondary"
                                    className="rounded-full border border-border/50 bg-background/80 px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                                  >
                                    {fileExtension}
                                  </Badge>
                                ) : null}
                              </div>
                              <span
                                className="block truncate font-mono text-xs text-muted-foreground"
                                title={record.fileId}
                              >
                                {record.fileId}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize", getStatusAccent(record.status).badge)}>
                            {record.status ? record.status.toLowerCase() : "unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTimeSafe(record.uploadedAt)}</TableCell>
                        <TableCell>{formatDateTimeSafe(record.analyzedAt)}</TableCell>
                        <TableCell className="text-right">
                          {record.totalFlows != null
                            ? formatNumber(record.totalFlows, integerFormatter)
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {record.overallQuality ? (
                            <Badge
                              variant="outline"
                              className={cn("uppercase", getQualityAccent(record.overallQuality))}
                            >
                              {record.overallQuality}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.sizeBytes != null ? formatBytes(record.sizeBytes) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className="gap-2"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigateToRecord(record.fileId);
                            }}
                          >
                            <MousePointerClick className="h-4 w-4" />
                            View report
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center">
              <CardTitle className="text-lg">No captures analyzed yet</CardTitle>
              <CardDescription className="mt-2 max-w-xl mx-auto">
                Upload a PCAP to kick off analysis. Completed results will appear here, ready for a
                deeper dive.
              </CardDescription>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>{footerText}</div>
          {hasRecords && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="text-sm text-muted-foreground">Rows per page: {size}</div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page <= 0}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1 || remotePage?.last}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>

      {!usesNavigation && <AnalysisReportView fileId={selectedRecord?.fileId ?? null} />}
    </div>
  );
}

function formatDateTimeSafe(value: string | null | undefined) {
  if (!value) return "—";
  return formatDateTime(value);
}

function getStatusAccent(status?: string) {
  const key = status?.toLowerCase() ?? "";
  if (key === "completed" || key === "success" || key === "done") {
    return {
      badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    };
  }
  if (key === "failed" || key === "error") {
    return {
      badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    };
  }
  if (key === "processing" || key === "pending" || key === "running") {
    return {
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    };
  }
  return {
    badge: "bg-muted text-muted-foreground border-border/50",
  };
}

function getQualityAccent(quality: string) {
  const key = quality.toLowerCase();
  if (key.includes("excellent") || key.includes("great") || key.includes("perfect")) {
    return "border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
  }
  if (key.includes("good") || key.includes("normal")) {
    return "border-sky-500/30 text-sky-600 dark:text-sky-400";
  }
  if (key.includes("fair") || key.includes("moderate")) {
    return "border-amber-500/30 text-amber-600 dark:text-amber-400";
  }
  if (key.includes("poor") || key.includes("bad") || key.includes("critical")) {
    return "border-rose-500/30 text-rose-600 dark:text-rose-400";
  }
  return "border-border/50 text-muted-foreground";
}

function getFileExtension(fileName: string | null | undefined) {
  if (!fileName) return null;
  const normalized = fileName.split(/[/\\]/).pop();
  if (!normalized) return null;
  const parts = normalized.split(".").filter(Boolean);
  if (parts.length <= 1) return null;
  const last = parts[parts.length - 1]?.toUpperCase();
  const penultimate = parts[parts.length - 2]?.toUpperCase();
  if (last && ["GZ", "BZ2", "XZ", "ZST"].includes(last) && penultimate) {
    return `${penultimate}.${last}`;
  }
  return last ?? null;
}

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1.4fr_0.8fr_1fr_1fr_0.6fr_0.8fr_0.6fr_0.6fr] items-center gap-4 rounded-lg border border-border/40 px-4 py-3"
        >
          {Array.from({ length: 8 }).map((__, skeletonIndex) => (
            <Skeleton key={skeletonIndex} className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
