"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useSession } from "@/features/auth/client/use-session";
import {
  ConnectionStatus,
  NotificationPayloadOrigin,
  useNotificationStream,
} from "@/features/notifications/client/use-notification-stream";
import { markManyNotificationsRead } from "@/core/services/notifications";

import type { Notification, NotificationsStateSnapshot } from "./types";

interface NotificationsState extends NotificationsStateSnapshot {
  loading: boolean;
  error: string | null;
  socketStatus: ConnectionStatus;
  isPolling: boolean;
}

type NotificationsAction =
  | { type: "bootstrap_pending" }
  | { type: "bootstrap_success"; payload: { notifications: Notification[]; receivedAt: string } }
  | { type: "bootstrap_error"; payload: { error: string } }
  | {
      type: "upsert";
      payload: { notifications: Notification[]; receivedAt: string };
    }
  | { type: "mark_read_optimistic"; payload: { ids: string[] } }
  | { type: "mark_read_rollback"; payload: { notifications: Notification[] } }
  | { type: "socket_status"; payload: { status: ConnectionStatus } }
  | { type: "set_error"; payload: { error: string | null } }
  | { type: "set_polling"; payload: { isPolling: boolean } };

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  socketStatus: ConnectionStatus;
  error: string | null;
  isPolling: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markManyAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const initialState: NotificationsState = {
  entities: {},
  order: [],
  unreadCount: 0,
  loading: false,
  error: null,
  socketStatus: "idle",
  isPolling: false,
};

function sortByTimestampDesc(a: Notification, b: Notification) {
  const left = Date.parse(a.createdAt ?? a.generatedAt ?? "");
  const right = Date.parse(b.createdAt ?? b.generatedAt ?? "");
  // Newest first, fall back to lexical compare to keep order stable if dates invalid
  if (Number.isFinite(right - left)) {
    return right - left;
  }
  return b.id.localeCompare(a.id);
}

function recomputeOrder(entities: Record<string, Notification>) {
  return Object.values(entities).sort(sortByTimestampDesc).map((item) => item.id);
}

function recomputeUnreadCount(entities: Record<string, Notification>) {
  return Object.values(entities).reduce((acc, item) => (item.read ? acc : acc + 1), 0);
}

function resolveReadState(incoming: Partial<Notification>, existing?: Notification) {
  const incomingRead =
    typeof incoming.read === "boolean"
      ? incoming.read
      : undefined;
  const incomingReadAt =
    typeof incoming.readAt === "string" && incoming.readAt ? incoming.readAt : undefined;

  const existingReadAt =
    typeof existing?.readAt === "string" && existing.readAt ? existing.readAt : undefined;
  const existingRead =
    typeof existing?.read === "boolean"
      ? existing.read
      : existingReadAt
      ? true
      : false;

  const read = incomingRead ?? (incomingReadAt ? true : existingRead);
  const readAt = incomingReadAt ?? existingReadAt ?? undefined;

  return { read, readAt };
}

function upsertNotifications(
  state: NotificationsState,
  notifications: Notification[],
  receivedAt: string,
) {
  if (!notifications.length) {
    return { ...state, lastSyncedAt: receivedAt };
  }

  let changed = false;
  const nextEntities = { ...state.entities };

  for (const incoming of notifications) {
    const existing = nextEntities[incoming.id];
    if (!existing) {
      const { read, readAt } = resolveReadState(incoming);
      nextEntities[incoming.id] = { ...incoming, read, readAt };
      changed = true;
      continue;
    }

    // Merge keeping the freshest read status and properties
    const { read, readAt } = resolveReadState(incoming, existing);
    const merged: Notification = {
      ...existing,
      ...incoming,
      read,
      readAt,
    };

    // Avoid unnecessary assignments if nothing changed
    const hasDiff =
      existing.read !== merged.read ||
      existing.message !== merged.message ||
      existing.summary !== merged.summary ||
      existing.riskLevel !== merged.riskLevel ||
      existing.riskScore !== merged.riskScore ||
      existing.createdAt !== merged.createdAt ||
      existing.generatedAt !== merged.generatedAt ||
      existing.title !== merged.title ||
      existing.fileId !== merged.fileId ||
      existing.link !== merged.link ||
      existing.recommendations !== merged.recommendations ||
      existing.source !== merged.source ||
      existing.meta !== merged.meta ||
      existing.tags !== merged.tags;

    if (hasDiff) {
      nextEntities[incoming.id] = merged;
      changed = true;
    }
  }

  if (!changed) {
    return { ...state, lastSyncedAt: receivedAt };
  }

  return {
    ...state,
    entities: nextEntities,
    order: recomputeOrder(nextEntities),
    unreadCount: recomputeUnreadCount(nextEntities),
    lastSyncedAt: receivedAt,
  };
}

function markIdsAsRead(state: NotificationsState, ids: string[], read: boolean) {
  if (!ids.length) return state;
  let changed = false;
  const nextEntities = { ...state.entities };

  for (const id of ids) {
    const existing = nextEntities[id];
    if (!existing) continue;
    if (existing.read === read) continue;
    nextEntities[id] = { ...existing, read, readAt: read ? new Date().toISOString() : existing.readAt };
    changed = true;
  }

  if (!changed) return state;

  return {
    ...state,
    entities: nextEntities,
    unreadCount: recomputeUnreadCount(nextEntities),
  };
}

function notificationsReducer(state: NotificationsState, action: NotificationsAction): NotificationsState {
  switch (action.type) {
    case "bootstrap_pending":
      return { ...state, loading: true, error: null };
    case "bootstrap_success":
      return {
        ...upsertNotifications(state, action.payload.notifications, action.payload.receivedAt),
        loading: false,
        error: null,
      };
    case "bootstrap_error":
      return { ...state, loading: false, error: action.payload.error };
    case "upsert":
      return upsertNotifications(state, action.payload.notifications, action.payload.receivedAt);
    case "mark_read_optimistic":
      return markIdsAsRead(state, action.payload.ids, true);
    case "mark_read_rollback":
      if (!action.payload.notifications.length) return state;
      let next = state;
      for (const item of action.payload.notifications) {
        next = {
          ...next,
          entities: {
            ...next.entities,
            [item.id]: item,
          },
        };
      }
      return {
        ...next,
        unreadCount: recomputeUnreadCount(next.entities),
        order: recomputeOrder(next.entities),
      };
    case "socket_status":
      return { ...state, socketStatus: action.payload.status };
    case "set_error":
      return { ...state, error: action.payload.error };
    case "set_polling":
      return { ...state, isPolling: action.payload.isPolling };
    default:
      return state;
  }
}

function shouldRaiseToast(notification: Notification) {
  const level = notification.riskLevel?.toLowerCase();
  if (!level && typeof notification.riskScore !== "number") return false;
  if (level === "critical" || level === "high") return true;
  if (typeof notification.riskScore === "number" && notification.riskScore >= 80) return true;
  return false;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [{ entities, order, unreadCount, loading, error, socketStatus, isPolling, lastSyncedAt }, dispatch] =
    useReducer(notificationsReducer, initialState);
  const { accessToken } = useSession();
  const router = useRouter();

  const stateRef = useRef(initialState);
  stateRef.current = {
    entities,
    order,
    unreadCount,
    loading,
    error,
    socketStatus,
    isPolling,
    lastSyncedAt,
  };

  const handleBootstrapStart = useCallback(() => {
    dispatch({ type: "bootstrap_pending" });
  }, [dispatch]);

  const handleBootstrapError = useCallback((message: string) => {
    dispatch({ type: "bootstrap_error", payload: { error: message } });
  }, [dispatch]);

  const handleStatus = useCallback((status: ConnectionStatus) => {
    dispatch({ type: "socket_status", payload: { status } });
  }, [dispatch]);

  const handleError = useCallback((message: string | null) => {
    dispatch({ type: "set_error", payload: { error: message } });
  }, [dispatch]);

  const handlePollingChange = useCallback((polling: boolean) => {
    dispatch({ type: "set_polling", payload: { isPolling: polling } });
  }, [dispatch]);

  const handlePayload = useCallback(
    (notifications: Notification[], receivedAt: string, origin: NotificationPayloadOrigin) => {
      if (origin === "bootstrap") {
        dispatch({ type: "bootstrap_success", payload: { notifications, receivedAt } });
      } else {
        dispatch({ type: "upsert", payload: { notifications, receivedAt } });
      }

      if (origin !== "stream") return;

      for (const notification of notifications) {
        if (!notification.read && shouldRaiseToast(notification)) {
          toast(notification.title, {
            description:
              notification.message ??
              notification.summary ??
              notification.recommendations?.join("\n") ??
              "High risk event detected",
            action: notification.fileId
              ? {
                  label: "View report",
                  onClick: () => router.push(`/dashboard/history/${notification.fileId}`),
                }
              : undefined,
          });
        }
      }
    },
    [dispatch, router],
  );

  const { refresh } = useNotificationStream({
    accessToken,
    lastSyncedAt,
    onBootstrapStart: handleBootstrapStart,
    onBootstrapError: handleBootstrapError,
    onPayload: handlePayload,
    onStatus: handleStatus,
    onError: handleError,
    onPollingChange: handlePollingChange,
  });

  const markManyAsRead = useCallback(
    async (ids: string[]) => {
      if (!ids.length) return;
      const previous = ids
        .map((id) => stateRef.current.entities[id])
        .filter((item): item is Notification => Boolean(item));

      dispatch({ type: "mark_read_optimistic", payload: { ids } });

      try {
        await markManyNotificationsRead(ids);
      } catch (err) {
        dispatch({ type: "mark_read_rollback", payload: { notifications: previous } });
        dispatch({
          type: "set_error",
          payload: {
            error: err instanceof Error ? err.message : "Failed to mark notification as read",
          },
        });
      }
    },
    [],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      await markManyAsRead([id]);
    },
    [markManyAsRead],
  );

  const markAllAsRead = useCallback(async () => {
    const unreadIds = Object.values(stateRef.current.entities)
      .filter((item) => !item.read)
      .map((item) => item.id);
    await markManyAsRead(unreadIds);
  }, [markManyAsRead]);

  const notifications = useMemo(
    () =>
      order
        .map((id) => entities[id])
        .filter((item): item is Notification => Boolean(item)),
    [entities, order],
  );

  const contextValue = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      socketStatus,
      error,
      isPolling,
      refresh,
      markAsRead,
      markManyAsRead,
      markAllAsRead,
    }),
    [
      error,
      isPolling,
      loading,
      markAllAsRead,
      markAsRead,
      markManyAsRead,
      notifications,
      refresh,
      socketStatus,
      unreadCount,
    ],
  );

  return <NotificationsContext.Provider value={contextValue}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
