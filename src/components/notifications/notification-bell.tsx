"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  ChevronRight,
  Flame,
  Info,
  Loader2,
  ShieldAlert,
  WifiOff,
} from "lucide-react";

import { useNotifications } from "@/features/notifications";
import { useSession } from "@/features/auth/client";
import { cn } from "@/lib/utils";
import { formatRelativeTime, formatToLocale } from "@/lib/datetime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type NotificationItem = ReturnType<typeof useNotifications>["notifications"][number];

function getSeverityMeta(notification: NotificationItem) {
  const level = notification.riskLevel?.toLowerCase();
  const score = notification.riskScore ?? 0;

  if (level === "critical" || score >= 90) {
    return {
      icon: AlertTriangle,
      iconClass: "text-destructive",
      badgeClass: "bg-destructive/15 text-destructive",
    };
  }
  if (level === "high" || score >= 75) {
    return {
      icon: Flame,
      iconClass: "text-amber-500",
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    };
  }
  if (level === "medium") {
    return {
      icon: ShieldAlert,
      iconClass: "text-blue-500",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    };
  }
  return {
    icon: Info,
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted/80 text-muted-foreground",
  };
}

function NotificationListItem({
  notification,
  href,
  onOpen,
  onMarkRead,
}: {
  notification: NotificationItem;
  href?: string;
  onOpen: () => void;
  onMarkRead: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  const severity = getSeverityMeta(notification);
  const Icon = severity.icon;
  const createdLabel = formatRelativeTime(notification.createdAt ?? notification.generatedAt ?? "");
  const createdExact = formatToLocale(notification.createdAt ?? notification.generatedAt ?? "");
  const title = "Uploaded file is processed";
  const riskLabel = notification.riskLevel ?? "info";

  return (
    <div
      className={cn(
        "group relative flex w-full cursor-pointer items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors",
        notification.read
          ? "hover:border-border/70 hover:bg-muted/60"
          : "border-primary/40 bg-primary/10 hover:border-primary/50 hover:bg-primary/15",
      )}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/60 text-muted-foreground transition-colors",
          notification.read
            ? severity.iconClass
            : "border-primary/40 bg-primary/15 text-primary shadow-xs",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p
              className={cn(
                "truncate text-sm leading-5",
                notification.read ? "font-medium text-foreground/80" : "font-semibold text-foreground",
              )}
            >
              {title}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-full border-transparent px-2 py-0 text-[10px] uppercase tracking-wide",
              severity.badgeClass,
            )}
          >
            {riskLabel}
          </Badge>
        </div>
        <div className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground/70">
          <span className="font-medium text-muted-foreground" title={createdExact}>
            {createdLabel}
          </span>
          <div className="ml-auto inline-flex items-center gap-2">
            {href && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary/80">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <span className="tracking-wide">View history</span>
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (notification.read) return;
                onMarkRead(event);
              }}
              disabled={notification.read}
              className={cn(
                "h-6 rounded-full px-2 text-[11px] font-medium text-muted-foreground transition-colors",
                !notification.read && "text-primary hover:text-primary/80",
              )}
              aria-label={notification.read ? "Notification is read" : "Mark notification as read"}
            >
              <Check className="h-3 w-3" aria-hidden="true" />
              <span>{notification.read ? "Read" : "Mark read"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    socketStatus,
    isPolling,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const { user } = useSession();

  if (!user) return null;

  const hasNotifications = notifications.length > 0;
  const isConnected = socketStatus === "connected";
  const isOffline = socketStatus === "disconnected";

  const handleNotificationOpen = (notificationId: string, href?: string) => {
    void markAsRead(notificationId);
    if (href) {
      router.push(href);
    }
  };

  const resolveHref = (notification: (typeof notifications)[number]) => {
    if (notification.link) return notification.link;
    if (notification.fileId) return `/dashboard/history/${notification.fileId}`;
    return undefined;
  };

  const connectionBadge = (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 rounded-full border-border/50 bg-muted/50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        isOffline && "border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        isPolling && "border-blue-500/60 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      )}
    >
      {isConnected && (
        <span className="flex h-2 w-2 items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      )}
      {!isConnected && isPolling && <Loader2 className="h-3 w-3 animate-spin" />}
      {!isConnected && !isPolling && <WifiOff className="h-3 w-3" />}
      {isConnected && "Live"}
      {isPolling && !isConnected && "Syncing"}
      {!isConnected && !isPolling && "Offline"}
    </Badge>
  );

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "relative h-9 w-9 rounded-full border-border/60 bg-background/80 text-muted-foreground transition hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30",
                !isConnected && "border-amber-500/60 text-amber-600 dark:text-amber-400",
              )}
              aria-label="Open notifications"
            >
              {isConnected ? (
                <Bell className="h-4 w-4" aria-hidden="true" />
              ) : (
                <BellOff className="h-4 w-4" aria-hidden="true" />
              )}
              {loading && (
                <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {isConnected ? "Notifications" : "Notifications (reconnecting)"}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        className="w-[22rem] max-w-[90vw] overflow-hidden rounded-xl border border-border/60 bg-background/95 p-0 shadow-lg backdrop-blur"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
              Notifications
            </DropdownMenuLabel>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="border-transparent bg-primary/10 text-[11px] font-medium uppercase tracking-wide text-primary"
              >
                {unreadCount > 99 ? "99+" : unreadCount} new
              </Badge>
            )}
          </div>
          {connectionBadge}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[22rem] space-y-1 overflow-y-auto p-2" role="list" aria-label="Recent notifications">
          {hasNotifications ? (
            notifications.map((notification) => {
              const href = resolveHref(notification);
              const openNotification = () => handleNotificationOpen(notification.id, href);
              const markRead = (event: ReactMouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                event.stopPropagation();
                void markAsRead(notification.id);
              };
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-0 focus:bg-transparent data-[highlighted]:bg-transparent"
                  onSelect={(event) => {
                    event.preventDefault();
                    openNotification();
                  }}
                >
                  <NotificationListItem
                    notification={notification}
                    href={href}
                    onOpen={openNotification}
                    onMarkRead={markRead}
                  />
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-muted-foreground">
                You&apos;re all caught up!
              </p>
              <p className="text-xs text-muted-foreground/80">
                New alerts from your analysis pipelines will appear here.
              </p>
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => {
              if (unreadCount === 0) return;
              void markAllAsRead();
            }}
            disabled={unreadCount === 0}
            className="h-8 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Mark all read
          </Button>
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="h-8 rounded-full text-xs font-semibold text-foreground"
          >
            <Link href="/dashboard/notifications">Open inbox</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
