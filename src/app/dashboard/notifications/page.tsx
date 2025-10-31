"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, BellRing, Check, History, RefreshCcw } from "lucide-react";

import { useNotifications } from "@/features/notifications";
import { cn } from "@/lib/utils";
import { formatRelativeTime, formatToLocale } from "@/lib/datetime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SortOrder = "asc" | "desc";

const STATUS_BADGE = {
  unread: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  read: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
} as const;

const RISK_STYLE: Record<
  string,
  {
    badge: string;
    accent: string;
  }
> = {
  critical: {
    badge: "bg-destructive/20 text-destructive border-destructive/40",
    accent: "border-destructive/40 bg-destructive/5",
  },
  high: {
    badge: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40",
    accent: "border-amber-500/40 bg-amber-500/5",
  },
  medium: {
    badge: "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/40",
    accent: "border-blue-500/40 bg-blue-500/5",
  },
  low: {
    badge: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40",
    accent: "border-emerald-500/40 bg-emerald-500/5",
  },
  info: {
    badge: "bg-muted/70 text-muted-foreground border-border/40",
    accent: "border-border/50 bg-muted/30",
  },
};

function getRiskStyle(level?: string) {
  if (!level) return RISK_STYLE.info;
  const key = level.toLowerCase();
  return RISK_STYLE[key] ?? RISK_STYLE.info;
}

function shortenFileId(value: string) {
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markManyAsRead,
    markAllAsRead,
    refresh,
    socketStatus,
    isPolling,
  } = useNotifications();

  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  const sortedNotifications = useMemo(() => {
    const normalized = notifications.map((item) => ({
      ...item,
      title: item.fileId ? `Report for ${item.fileId}` : item.title,
      timestamp: item.createdAt ?? item.generatedAt ?? "",
    }));

    const sorted = [...normalized].sort((a, b) => {
      const left = Date.parse(a.timestamp);
      const right = Date.parse(b.timestamp);
      const delta = (left || 0) - (right || 0);
      return sortOrder === "asc" ? delta : -delta;
    });

    return sorted;
  }, [notifications, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedNotifications.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const pagedNotifications = useMemo(
    () =>
      sortedNotifications.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [page, sortedNotifications],
  );

  const pageRangeLabel = sortedNotifications.length
    ? `${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, sortedNotifications.length)}`
    : "0";

  const toggleSorting = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const connectionStateLabel = (() => {
    if (socketStatus === "connected") return "Live stream active";
    if (socketStatus === "connecting") return "Reconnecting…";
    if (socketStatus === "disconnected") return "Realtime offline";
    return socketStatus ?? "Idle";
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Notification inbox</h1>
          <p className="text-sm text-muted-foreground">
            Review analyzer alerts, triage them in bulk, or jump straight into detailed reports.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Inbox status
            </CardDescription>
            <CardTitle className="text-foreground">Unread alerts</CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-foreground">{unreadCount}</span>
            <Badge
              variant="outline"
              className={cn(
                "border-transparent px-2 py-0 text-[10px] uppercase tracking-wide",
                unreadCount ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-600",
              )}
            >
              {unreadCount ? "attention" : "all read"}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Activity
            </CardDescription>
            <CardTitle className="text-foreground">Total alerts</CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between">
            <span className="text-3xl font-semibold text-foreground">{notifications.length}</span>
            <Badge variant="outline" className="border-transparent px-2 py-0 text-[10px] uppercase tracking-wide">
              all alerts
            </Badge>
          </CardContent>
        </Card>
        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Connection
            </CardDescription>
            <CardTitle className="text-foreground">Realtime status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span>{connectionStateLabel}</span>
            {isPolling && (
              <Badge variant="secondary" className="border-transparent bg-blue-500/10 text-blue-600">
                Polling
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Quick action
            </CardDescription>
            <CardTitle className="text-foreground">Analysis history</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              Jump directly into full reports for deeper investigation.
            </p>
            <Button size="sm" variant="secondary" className="gap-2" asChild>
              <Link href="/dashboard/history">
                <History className="h-4 w-4" />
                View history
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/60">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" size="sm" className="w-fit gap-2" onClick={toggleSorting}>
              <ArrowUpDown className="h-4 w-4" />
              Sort ({sortOrder === "desc" ? "newest" : "oldest"})
            </Button>
            <Badge variant="outline" className="w-fit border-transparent bg-muted/60 text-xs text-muted-foreground">
              Showing {pageRangeLabel} of {sortedNotifications.length} alerts
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/10 px-6 py-12 text-center text-blue-700 dark:text-blue-200">
              <BellRing className="h-8 w-8" aria-hidden="true" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground dark:text-foreground">
                  No alerts to show yet
                </p>
                <p className="text-xs">
                  Refresh the stream to sync with the analyzer or upload a new capture.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => void refresh()}>
                Refresh stream
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pagedNotifications.map((notification) => {
                  const href = notification.link
                    ? notification.link
                    : notification.fileId
                    ? `/dashboard/history/${notification.fileId}`
                    : undefined;
                const { badge } = getRiskStyle(notification.riskLevel);
                const statusClass = STATUS_BADGE[notification.read ? "read" : "unread"];
                const timestamp = notification.createdAt ?? notification.generatedAt ?? "";
                const description =
                  notification.message ??
                  notification.summary ??
                  (notification.recommendations && notification.recommendations.length > 0
                    ? notification.recommendations[0]
                    : "Analyzer completed without additional notes.");

                return (
                  <div
                    key={notification.id}
                    className="group relative flex flex-col gap-4 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-background to-background p-5 shadow-sm transition hover:border-blue-500/40 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-200">
                          <BellRing className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("border text-[10px] uppercase tracking-wide", badge)}
                        >
                          {notification.riskLevel ?? "info"}
                        </Badge>
                        <h2
                          className={cn(
                            "text-base leading-tight",
                            notification.read
                              ? "font-medium text-foreground/80"
                              : "font-semibold text-foreground",
                          )}
                        >
                          {notification.title ?? notification.fileId ?? notification.id}
                        </h2>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("border-transparent px-2 text-[10px] uppercase tracking-wide", statusClass)}
                      >
                        {notification.read ? "Read" : "Unread"}
                      </Badge>
                    </div>

                    <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatRelativeTime(timestamp)}</span>
                      <span aria-hidden className="text-muted-foreground/40">•</span>
                      <span>{formatToLocale(timestamp)}</span>
                      {notification.fileId && (
                        <>
                          <span aria-hidden className="text-muted-foreground/40">•</span>
                          <span className="font-mono text-[11px]">{shortenFileId(notification.fileId)}</span>
                        </>
                      )}
                      {typeof notification.riskScore === "number" && (
                        <>
                          <span aria-hidden className="text-muted-foreground/40">•</span>
                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-700 dark:text-blue-200">
                            Score {notification.riskScore}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 border-t border-border/40 pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-blue-700 hover:bg-blue-500/10 hover:text-blue-800 dark:text-blue-200"
                        onClick={() => void markManyAsRead([notification.id])}
                        disabled={notification.read}
                      >
                        Mark read
                      </Button>
                      {href && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 text-xs"
                          asChild
                        >
                          <Link href={href}>Open report</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                    );
                  })}
              </div>

              {totalPages > 1 ? (
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                  <span>
                    Page {page + 1} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
