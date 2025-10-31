"use client";

import { WifiOff, RefreshCw } from "lucide-react";

import { useNotifications } from "@/features/notifications";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function NotificationConnectionBanner() {
  const { socketStatus, isPolling, refresh } = useNotifications();

  const showBanner = socketStatus === "disconnected" || (socketStatus === "connecting" && isPolling);
  if (!showBanner) return null;

  const icon =
    socketStatus === "disconnected" ? (
      <WifiOff className="h-4 w-4" />
    ) : (
      <RefreshCw className="h-4 w-4 animate-spin" />
    );

  const statusLabel = socketStatus === "disconnected" ? "Realtime channel offline" : "Reconnecting to live stream";
  const detail = isPolling ? "Polling for new alerts" : "Restoring live updates";
  const badgeText = socketStatus === "disconnected" ? "offline" : "reconnecting";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "mx-4 mb-2 flex items-start gap-3 rounded-md border px-4 py-2.5 text-sm",
        "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      )}
    >
      <span className="mt-0.5 text-amber-600 dark:text-amber-300">{icon}</span>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{statusLabel}</span>
          <Badge
            variant="outline"
            className="border-transparent bg-amber-500/20 text-[10px] uppercase tracking-wide text-amber-700 dark:text-amber-200"
          >
            {badgeText}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-amber-700/80 dark:text-amber-200/80">{detail}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 px-3 text-xs text-amber-700 hover:text-amber-800 dark:text-amber-200"
            onClick={() => {
              void refresh();
            }}
          >
            Retry now
          </Button>
        </div>
      </div>
    </div>
  );
}
