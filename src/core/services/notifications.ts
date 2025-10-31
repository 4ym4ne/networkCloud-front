import type { Notification } from "@/features/notifications/types";
import { apiRequest } from "@/core/http/api-client";

export async function fetchNotifications(params?: { since?: string }): Promise<Notification[]> {
  const search = new URLSearchParams();
  if (params?.since) {
    search.set("since", params.since);
  }

  const url = `/api/notifications${search.size ? `?${search.toString()}` : ""}`;
  return apiRequest<Notification[]>(url, { method: "GET" });
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiRequest(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: true }),
  });
}

export async function markManyNotificationsRead(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => markNotificationRead(id)));
}
