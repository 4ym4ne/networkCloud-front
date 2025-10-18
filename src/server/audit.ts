import crypto from "crypto";
import { redis } from "@/server/redis";
import { envServer } from "@/config/env.server";
import { logger } from "@/lib/logger";

export type AuthEventType =
    | "login_success"
    | "login_failure"
    | "refresh_success"
    | "refresh_failure"
    | "logout"
    | "token_revoked"
    | "token_revocation_failed";

export interface AuthEvent {
    event: AuthEventType;
    ts: string; // ISO timestamp
    actor?: string | undefined; // pseudonymized actor identifier (HMAC)
    username?: string | undefined; // pseudonymized username
    sid?: string | undefined; // masked session id
    ip?: string | undefined; // masked ip
    outcome?: string | undefined; // e.g. 'ok', 'failed'
    reason?: string | undefined; // short reason
    meta?: Record<string, any> | undefined; // optional metadata (non-sensitive)
}

function pseudonymize(value?: string) {
    if (!value) return undefined;
    const h = crypto.createHmac("sha256", envServer.SESSION_SECRET).update(value).digest("hex");
    return h.slice(0, 12);
}

function maskSid(sid?: string) {
    if (!sid) return undefined;
    if (sid.length <= 8) return sid;
    return `${sid.slice(0, 6)}..${sid.slice(-2)}`;
}

function maskIp(ip?: string) {
    if (!ip) return undefined;
    // strip potential multiple forwarded IPs, take first
    const first = ip.split(",")[0].trim();
    // IPv4
    if (/^\d+\.\d+\.\d+\.\d+$/.test(first)) {
        const parts = first.split(".");
        return `${parts[0]}.${parts[1]}.x.x`;
    }
    // IPv6: keep first 3 groups
    if (first.includes(":")) {
        const parts = first.split(":");
        return parts.slice(0, 3).join(":") + ":::";
    }
    return first;
}

export async function auditAuthEvent(event: {
    type: AuthEventType;
    sub?: string | undefined;
    username?: string | undefined;
    sid?: string | undefined;
    ip?: string | undefined;
    outcome?: string | undefined;
    reason?: string | undefined;
    meta?: Record<string, any> | undefined;
}) {
    try {
        const entry: AuthEvent = {
            event: event.type,
            ts: new Date().toISOString(),
            actor: pseudonymize(event.sub ?? event.username),
            username: event.username ? pseudonymize(event.username) : undefined,
            sid: maskSid(event.sid),
            ip: maskIp(event.ip),
            outcome: event.outcome ?? undefined,
            reason: event.reason ?? undefined,
            meta: event.meta ?? undefined,
        };

        // Console output (structured) for immediate debugging/ops visibility
        logger.info("AUDIT", JSON.stringify(entry));

        // Persist to Redis list for durability and later analysis (optional)
        try {
            await redis.rPush("audit:auth", JSON.stringify(entry));
            // Keep list bounded (trim to last 5000 entries)
            await redis.lTrim("audit:auth", -5000, -1);
        } catch (err) {
            // Non-fatal: log but continue
            logger.warn("AUDIT: failed to persist to Redis:", err);
        }

        return entry;
    } catch (err) {
        logger.error("AUDIT: unexpected error:", err);
        return null;
    }
}
