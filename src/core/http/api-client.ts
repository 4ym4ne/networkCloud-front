"use client";

import { apiFetch } from "@/core/http/api-fetch";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function isJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(url, options);

  const body = isJsonResponse(response) ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (body && typeof body === "object" && "error" in (body as Record<string, unknown>))
        ? String((body as Record<string, unknown>).error)
        : response.statusText || "Request failed";
    throw new ApiError(message, response.status, body);
  }

  return body as T;
}
