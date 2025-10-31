"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { formatBytes, formatNumber, formatPercent, integerFormatter } from "./formatters";
import type { AnalysisFlow, LoadState } from "./types";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

interface FlowTableProps {
  flows: AnalysisFlow[] | null;
  status: LoadState;
  error: string | null;
  onRetry: () => void;
  defaultPageSize?: number;
  className?: string;
}

export function FlowTable({
  flows,
  status,
  error,
  onRetry,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  className,
}: FlowTableProps) {
  const allowedPageSizes = PAGE_SIZE_OPTIONS as readonly number[];
  const [pageSize, setPageSize] = useState(() =>
    allowedPageSizes.includes(defaultPageSize) ? defaultPageSize : DEFAULT_PAGE_SIZE,
  );
  const [page, setPage] = useState(1);

  const totalFlows = flows?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFlows / pageSize));
  const isInitialLoading = status === "loading" && !flows;
  const isError = status === "error";

  useEffect(() => {
    setPage(1);
  }, [pageSize, totalFlows]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedFlows = useMemo(() => {
    if (!flows) return [];
    const start = (page - 1) * pageSize;
    return flows.slice(start, start + pageSize);
  }, [flows, page, pageSize]);

  return (
    <Card className={cn("border border-border/50", className)}>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Flow breakdown</CardTitle>
          <CardDescription>Per-flow telemetry extracted by the analyzer.</CardDescription>
        </div>
        {flows && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Showing {paginatedFlows.length} of {formatNumber(totalFlows, integerFormatter)} flows
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isInitialLoading ? (
          <FlowTableSkeleton rows={pageSize} />
        ) : isError && !flows ? (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <div className="flex-1 text-sm">{error}</div>
            <Button size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : flows && flows.length === 0 ? (
          <div className="rounded-lg border border-border/40 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No flows available for this analysis yet.
          </div>
        ) : flows ? (
          <>
            {isError && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <div className="flex-1 text-xs">
                  {error ?? "Latest refresh failed. Showing cached data."}
                </div>
                <Button size="sm" variant="outline" onClick={onRetry}>
                  Retry
                </Button>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flow ID</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Protocol</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead className="text-right">Packets</TableHead>
                  <TableHead className="text-right">Bytes</TableHead>
                  <TableHead className="text-right">Throughput</TableHead>
                  <TableHead className="text-right">Loss</TableHead>
                  <TableHead className="text-right">RTT</TableHead>
                  <TableHead className="text-right">Jitter</TableHead>
                  <TableHead className="text-right">MOS</TableHead>
                  <TableHead>Quality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFlows.map((flow) => (
                  <TableRow
                    key={flow.id}
                    className={cn(
                      "transition-colors duration-200",
                      getQualityAccent(flow.quality).row,
                      "hover:shadow-sm",
                    )}
                  >
                    <TableCell>
                      <IdentifierCell value={flow.id} />
                    </TableCell>
                    <TableCell>
                      <EndpointCell ip={flow.srcIp} port={flow.srcPort} label="Src" />
                    </TableCell>
                    <TableCell>
                      <EndpointCell ip={flow.dstIp} port={flow.dstPort} label="Dst" />
                    </TableCell>
                    <TableCell className="uppercase text-xs text-muted-foreground">
                      {flow.protocol}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border bg-transparent",
                          getClassificationAccent(flow.classification),
                        )}
                      >
                        {flow.classification}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(flow.packets, integerFormatter)}
                    </TableCell>
                    <TableCell className="text-right">{formatBytes(flow.bytes)}</TableCell>
                    <TableCell className="text-right">
                      {`${formatNumber(flow.throughputMbps)} Mbps`}
                    </TableCell>
                    <TableCell className="text-right">{formatPercent(flow.loss)}</TableCell>
                    <TableCell className="text-right">{`${formatNumber(flow.rtt)} ms`}</TableCell>
                    <TableCell className="text-right">
                      {`${formatNumber(flow.jitter)} ms`}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(flow.mos)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "uppercase",
                          getQualityAccent(flow.quality).badge,
                        )}
                      >
                        {flow.quality}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
            }}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function IdentifierCell({ value }: { value: string }) {
  const displayValue = compactValue(value, { prefix: 10, suffix: 6 });

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-1.5">
            <Badge
              variant="secondary"
              className="rounded-sm border border-border/50 bg-background/80 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Flow
            </Badge>
            <span className="font-mono text-xs text-muted-foreground max-w-[180px] truncate">
              {displayValue}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="font-mono text-xs text-background">{value}</TooltipContent>
      </Tooltip>
      <CopyButton value={value} ariaLabel="Copy flow ID" />
    </div>
  );
}

function EndpointCell({ ip, port, label }: { ip: string; port: number | null; label: string }) {
  const combined = port != null ? `${ip}:${port}` : ip;
  const displayIp = compactValue(ip, { prefix: 14, suffix: 8 });

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-border/40 bg-muted/20 px-2 py-1.5">
            <Badge
              variant="secondary"
              className="rounded-sm border border-border/50 bg-background/80 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {label}
            </Badge>
            <span className="font-mono text-xs text-foreground max-w-[160px] truncate">
              {displayIp}
            </span>
            <Badge
              variant="outline"
              className="border-border/60 bg-background/80 font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
            >
              {port ?? "—"}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent className="space-y-1">
          <div className="font-mono text-xs text-background">{ip}</div>
          <div className="text-xs text-background/80">
            Port {port != null ? port : "—"}
          </div>
        </TooltipContent>
      </Tooltip>
      <CopyButton value={combined} ariaLabel={`Copy ${label} endpoint`} />
    </div>
  );
}

interface CopyButtonProps {
  value: string;
  ariaLabel: string;
}

function CopyButton({ value, ariaLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => {
      setCopied(false);
    }, 1500);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [copied]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation();
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
              navigator.clipboard
                .writeText(value)
                .then(() => setCopied(true))
                .catch(() => setCopied(false));
            }
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="sr-only">{ariaLabel}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied!" : ariaLabel}</TooltipContent>
    </Tooltip>
  );
}

function compactValue(
  value: string,
  { prefix = 8, suffix = 6 }: { prefix?: number; suffix?: number } = {},
) {
  if (value.length <= prefix + suffix + 3) {
    return value;
  }
  return `${value.slice(0, prefix)}...${value.slice(-suffix)}`;
}

function FlowTableSkeleton({ rows }: { rows: number }) {
  const skeletonRows = Array.from({ length: Math.min(rows, 5) }, (_, index) => index);

  return (
    <div className="space-y-3">
      {skeletonRows.map((key) => (
        <div key={key} className="grid grid-cols-13 gap-3 rounded-lg border border-border/40 p-3">
          {Array.from({ length: 13 }).map((_, cellIndex) => (
            <Skeleton key={cellIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

function getQualityAccent(quality: string) {
  const key = quality?.toLowerCase() ?? "";
  if (key.includes("excellent") || key.includes("great") || key.includes("perfect")) {
    return {
      row: "bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12]",
      badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    };
  }
  if (key.includes("good") || key.includes("normal")) {
    return {
      row: "bg-sky-500/[0.05] hover:bg-sky-500/[0.1]",
      badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    };
  }
  if (key.includes("fair") || key.includes("moderate")) {
    return {
      row: "bg-amber-500/[0.06] hover:bg-amber-500/[0.12]",
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    };
  }
  if (key.includes("poor") || key.includes("bad") || key.includes("critical")) {
    return {
      row: "bg-rose-500/[0.06] hover:bg-rose-500/[0.12]",
      badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    };
  }
  return {
    row: "bg-primary/5 hover:bg-primary/10",
    badge: "bg-primary/15 text-primary border-primary/30",
  };
}

function getClassificationAccent(classification: string) {
  const key = classification?.toLowerCase() ?? "";
  if (key.includes("voice") || key.includes("voip")) {
    return "border-violet-500/30 bg-violet-500/15 text-violet-600 dark:text-violet-400";
  }
  if (key.includes("video") || key.includes("stream")) {
    return "border-orange-500/30 bg-orange-500/15 text-orange-600 dark:text-orange-400";
  }
  if (key.includes("control") || key.includes("signal")) {
    return "border-cyan-500/30 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400";
  }
  if (key.includes("data") || key.includes("bulk")) {
    return "border-blue-500/30 bg-blue-500/15 text-blue-600 dark:text-blue-400";
  }
  if (key.includes("unknown") || key.includes("suspicious")) {
    return "border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400";
  }
  return "border-primary/30 bg-primary/10 text-primary";
}
