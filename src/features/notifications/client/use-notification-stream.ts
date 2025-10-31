"use client";

import { useCallback, useEffect, useRef } from "react";

import { apiFetch } from "@/core/http/api-fetch";

import type { Notification } from "../types";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected";
export type NotificationPayloadOrigin = "bootstrap" | "stream" | "poll" | "manual";

interface UseNotificationStreamOptions {
  accessToken: string | null;
  lastSyncedAt?: string;
  onBootstrapStart?: () => void;
  onBootstrapError?: (error: string) => void;
  onPayload: (notifications: Notification[], receivedAt: string, origin: NotificationPayloadOrigin) => void;
  onStatus?: (status: ConnectionStatus) => void;
  onError?: (message: string | null) => void;
  onPollingChange?: (active: boolean) => void;
}

const STREAM_ENDPOINT = "/api/notifications/stream";
const NOTIFICATIONS_ENDPOINT = "/api/notifications";
const POLL_INTERVAL_MS = 180_000;

function collectNotifications(candidate: unknown, depth = 0): Notification[] {
  if (!candidate || depth > 3) return [];
  if (Array.isArray(candidate)) {
    return candidate.flatMap((entry) => collectNotifications(entry, depth + 1));
  }
  if (typeof candidate === "object") {
    const entry = candidate as Record<string, unknown>;
    const maybe = entry as Partial<Notification>;
    if (typeof maybe.id === "string") {
      const title =
        typeof maybe.title === "string"
          ? maybe.title
          : typeof maybe.summary === "string"
          ? maybe.summary
          : "Notification";
      const createdAt =
        typeof maybe.createdAt === "string"
          ? maybe.createdAt
          : typeof maybe.generatedAt === "string"
          ? maybe.generatedAt
          : new Date().toISOString();
      const normalized: Notification = {
        ...maybe,
        id: maybe.id,
        title,
        createdAt,
        read:
          typeof maybe.read === "boolean"
            ? maybe.read
            : maybe.readAt
            ? true
            : false,
      } as Notification;
      return [normalized];
    }
    const nestedKeys = ["notifications", "notification", "data", "payload", "event", "body"];
    return nestedKeys.flatMap((key) => collectNotifications(entry[key], depth + 1));
  }
  return [];
}

function parseNotificationsPayload(payload: unknown): Notification[] {
  return collectNotifications(payload).filter((item): item is Notification => typeof item?.id === "string");
}

export function useNotificationStream({
  accessToken,
  lastSyncedAt,
  onBootstrapStart,
  onBootstrapError,
  onPayload,
  onStatus,
  onError,
  onPollingChange,
}: UseNotificationStreamOptions) {
  const accessTokenRef = useRef<string | null>(accessToken);
  const lastSyncedAtRef = useRef<string | undefined>(lastSyncedAt);
  const streamRef = useRef<EventSource | null>(null);
  const pollingRef = useRef<number | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    lastSyncedAtRef.current = lastSyncedAt;
  }, [lastSyncedAt]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
      onPollingChange?.(false);
    }
  }, [onPollingChange]);

  const fetchNotifications = useCallback(
    async (origin: "bootstrap" | "poll" | "manual") => {
      if (!accessTokenRef.current) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (origin === "bootstrap") {
        onBootstrapStart?.();
      }

      try {
        const params = new URLSearchParams();
        if (lastSyncedAtRef.current) {
          params.set("since", lastSyncedAtRef.current);
        }
        const url = params.size > 0 ? `${NOTIFICATIONS_ENDPOINT}?${params.toString()}` : NOTIFICATIONS_ENDPOINT;
        const res = await apiFetch(url, {
          method: "GET",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to load notifications (${res.status})`);
        }

        const payload = await res.json().catch(() => []);
        const notifications = parseNotificationsPayload(payload);
        const receivedAt = new Date().toISOString();

        onPayload(notifications, receivedAt, origin === "bootstrap" ? "bootstrap" : origin);
        if (origin === "bootstrap") {
          onError?.(null);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Failed to load notifications";
        if (origin === "bootstrap") {
          onBootstrapError?.(message);
        } else {
          onError?.(message);
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [onBootstrapError, onBootstrapStart, onError, onPayload],
  );

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    onPollingChange?.(true);
    pollingRef.current = window.setInterval(() => {
      void fetchNotifications("poll");
    }, POLL_INTERVAL_MS);
  }, [fetchNotifications, onPollingChange]);

  useEffect(() => {
    if (!accessToken) {
      cancelledRef.current = true;
      stopPolling();
      abortRef.current?.abort();
      abortRef.current = null;
      if (streamRef.current) {
        streamRef.current.close();
        streamRef.current = null;
      }
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      onStatus?.("idle");
      return;
    }

    cancelledRef.current = false;
    reconnectAttemptsRef.current = 0;
    onStatus?.("connecting");
    void fetchNotifications("bootstrap");

    const scheduleReconnect = () => {
      if (cancelledRef.current) return;
      const attempt = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = attempt;
      const delay = Math.min(1000 * attempt, 10_000);
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
      }
      reconnectRef.current = window.setTimeout(() => {
        reconnectRef.current = null;
        connectStream();
      }, delay);
    };

    const handleStatusEvent = (payload: any) => {
      if (!payload || typeof payload.status !== "string") return;
      const status = payload.status as string;
      if (status === "connected") {
        reconnectAttemptsRef.current = 0;
        onStatus?.("connected");
        onError?.(null);
        stopPolling();
      } else if (status === "reconnecting") {
        onStatus?.("connecting");
        if (typeof payload.reason === "string") {
          onError?.(payload.reason);
        }
        startPolling();
      } else if (status === "closed") {
        onStatus?.("disconnected");
        if (typeof payload.reason === "string") {
          onError?.(payload.reason);
        }
        startPolling();
        scheduleReconnect();
      } else if (status === "error") {
        if (typeof payload.message === "string") {
          onError?.(payload.message);
        }
      }
    };

    const connectStream = () => {
      if (cancelledRef.current) return;
      if (streamRef.current) {
        streamRef.current.close();
        streamRef.current = null;
      }

      onStatus?.("connecting");

      const stream = new EventSource(STREAM_ENDPOINT);
      streamRef.current = stream;

      stream.onopen = () => {
        if (cancelledRef.current) return;
        reconnectAttemptsRef.current = 0;
        onStatus?.("connected");
        onError?.(null);
        stopPolling();
      };

      stream.addEventListener("status", (event) => {
        if (cancelledRef.current) return;
        try {
          const payload = JSON.parse((event as MessageEvent<string>).data ?? "{}");
          handleStatusEvent(payload);
        } catch {
          // ignore malformed messages
        }
      });

      stream.onmessage = (event) => {
        if (cancelledRef.current) return;
        try {
          const payload = JSON.parse(event.data);
          const notifications = parseNotificationsPayload(payload);
          if (!notifications.length) return;
          const receivedAt = new Date().toISOString();
          onPayload(notifications, receivedAt, "stream");
          onError?.(null);
        } catch {
          // ignore malformed payloads
        }
      };

      stream.onerror = () => {
        if (cancelledRef.current) return;
        stream.close();
        streamRef.current = null;
        onStatus?.("disconnected");
        onError?.("Notification channel error");
        startPolling();
        scheduleReconnect();
      };
    };

    connectStream();

    return () => {
      cancelledRef.current = true;
      stopPolling();
      abortRef.current?.abort();
      abortRef.current = null;
      if (streamRef.current) {
        streamRef.current.close();
        streamRef.current = null;
      }
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      onStatus?.("idle");
    };
  }, [accessToken, fetchNotifications, onError, onStatus, startPolling, stopPolling]);

  const refresh = useCallback(() => fetchNotifications("manual"), [fetchNotifications]);

  return { refresh };
}
