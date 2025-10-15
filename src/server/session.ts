// src/server/session.ts
// **__ Secure Redis + Signed Session Management for Keycloak Tokens __**

import { SignJWT, jwtVerify, JWTPayload } from "jose";
import crypto from "crypto";
import { envServer as env } from "@/config/env.server";
import { redis } from "@/server/redis"; // shared Redis connection

// **__ Secret key (derived from SESSION_SECRET) __**
const secretKey = new TextEncoder().encode(env.SESSION_SECRET);

// **__ TTL (seconds) __**
const SESSION_TTL = env.SESSION_TTL ?? 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
    sub: string;            // Keycloak user ID
    username: string;       // Username
    access_token: string;   // Access token
    refresh_token?: string; // Refresh token
    roles?: string[];       // User roles
    expires_at: number;     // Epoch ms
}

/**
 * ✅ createSession()
 * Creates a signed JWT (JWS) and stores both session + user-sub mapping.
 */
export async function createSession(data: SessionData): Promise<string> {
    const sid = crypto.randomUUID();

    const token = await new SignJWT(data as unknown as JWTPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL)
        .sign(secretKey);

    // Save both session and reverse lookup
    await redis.set(`sess:${sid}`, token, { EX: SESSION_TTL });
    await redis.set(`user:${data.sub}`, sid, { EX: SESSION_TTL });

    return sid;
}

/**
 * ✅ getSession()
 * Verifies and returns the stored session payload.
 */
export async function getSession(sid: string): Promise<SessionData | null> {
    if (!sid) return null;

    const token = await redis.get(`sess:${sid}`);
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload as unknown as SessionData;
    } catch (err) {
        console.warn("⚠️ Invalid or expired session:", err);
        return null;
    }
}

/**
 * ✅ destroySession()
 * Deletes both session and user mapping from Redis.
 */
export async function destroySession(sid: string): Promise<void> {
    if (!sid) return;
    const session = await getSession(sid);
    if (session) {
        await redis.del(`user:${session.sub}`);
    }
    await redis.del(`sess:${sid}`);
}

/**
 * ✅ rotateSession()
 * Replaces existing session with a fresh one.
 */
export async function rotateSession(oldSid: string, data: SessionData): Promise<string> {
    await destroySession(oldSid);
    return await createSession(data);
}