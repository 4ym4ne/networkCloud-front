// src/server/session.ts
// Server-side session management using Redis (signed + encrypted payloads)

import crypto from "crypto";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { envServer as env } from "@/config/env.server";
import { redis } from "@/server/redis"; // shared Redis client

// TTL in seconds (default from env)
const SESSION_TTL = env.SESSION_TTL ?? 60 * 60 * 24 * 7;

export interface SessionData {
    sub: string;            // Keycloak user ID
    username: string;       // Username
    access_token: string;   // Access token
    refresh_token?: string; // Refresh token
    roles?: string[];       // User roles
    expires_at: number;     // access token expiry (epoch ms)
}

// Helper key builders
export const sessKey = (sid: string) => `sess:${sid}`;
export const userKey = (sub: string) => `user:${sub}`;

// Derived symmetric key for AES-256-GCM from SESSION_SECRET
const ENC_KEY = crypto.createHash("sha256").update(env.SESSION_SECRET).digest(); // 32 bytes
const JWT_SECRET = new TextEncoder().encode(env.SESSION_SECRET);

function encryptToken(plain: string): string {
    const iv = crypto.randomBytes(12); // 96-bit nonce for GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
    const ct = Buffer.concat([cipher.update(Buffer.from(plain, "utf8")), cipher.final()]);
    const tag = cipher.getAuthTag();
    // store as base64(iv || tag || ciphertext)
    return Buffer.concat([iv, tag, ct]).toString("base64");
}

function decryptToken(payload: string): string {
    const buf = Buffer.from(payload, "base64");
    if (buf.length < 12 + 16) throw new Error("invalid payload");
    const iv = buf.slice(0, 12);
    const tag = buf.slice(12, 28);
    const ct = buf.slice(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
    return pt.toString("utf8");
}

/**
 * createSession
 * - Signs session payload with JWS (HS256) and encrypts it with AES-GCM
 * - Stores encrypted blob under `sess:{sid}` and reverse mapping `user:{sub}` -> sid
 * - Uses a small Redis Lua script to atomically set both keys and delete any previous session for the user
 */
export async function createSession(data: SessionData): Promise<string> {
    const sid = crypto.randomUUID();

    // Sign payload into a compact JWS
    const token = await new SignJWT(data as unknown as JWTPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL)
        .sign(JWT_SECRET);

    const encrypted = encryptToken(token);

    const userK = userKey(data.sub);
    const maxRetries = 5;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // WATCH the user key to detect concurrent updates
            await redis.watch(userK);

            // Read current mapping
            const previousSid = await redis.get(userK);

            // Start transaction
            const multi = redis.multi();

            // Set new user -> sid mapping and session payload with TTLs
            multi.setEx(userK, SESSION_TTL, sid);
            multi.setEx(sessKey(sid), SESSION_TTL, encrypted);

            // If there was a previous sid different from the new one, delete its session payload
            if (previousSid && previousSid !== sid) {
                multi.del(sessKey(previousSid));
            }

            // Execute transaction atomically; exec returns null if transaction aborted due to watched key changes
            const execResult = await multi.exec();

            // If execResult is null, someone modified the watched key -> retry
            if (execResult === null) {
                // unwatch happens automatically after exec in node-redis when exec returns,
                // but explicitly ensure we unwatch before next attempt
                try {
                    await redis.unwatch();
                } catch {
                    /* ignore */
                }
                continue; // retry
            }

            // Success
            return sid;
        } catch (err) {
            // Ensure we unwatch on error before retrying/throwing
            try {
                await redis.unwatch();
            } catch {
                /* ignore */
            }

            // On non-retryable errors, surface them
            console.error("Failed to create session in Redis (attempt):", err);
            throw err;
        }
    }

    throw new Error("Failed to create session after concurrent updates");
}

/**
 * getSession
 * - Reads encrypted blob from Redis, decrypts it, verifies the JWS and returns SessionData
 */
export async function getSession(sid: string): Promise<SessionData | null> {
    if (!sid) return null;

    const raw = await redis.get(sessKey(sid));
    if (!raw) return null;

    try {
        const jws = decryptToken(raw);
        const { payload } = await jwtVerify(jws, JWT_SECRET);
        return payload as unknown as SessionData;
    } catch (err) {
        console.warn("Failed to decrypt/verify session payload (will delete):", sid, err);
        try {
            await redis.del(sessKey(sid));
        } catch {
            /* ignore */
        }
        return null;
    }
}

/**
 * destroySession
 * - Deletes the session payload and only removes the user->sid mapping
 *   if it still points to the session being destroyed (avoids race issues)
 */
export async function destroySession(sid: string): Promise<void> {
    if (!sid) return;

    const session = await getSession(sid);
    // Always remove the session payload
    try {
        await redis.del(sessKey(sid));
    } catch (e) {
        console.warn("Failed to delete session payload:", sid, e);
    }

    if (!session) return;

    // If the current mapping for the user still points to this sid, remove it.
    try {
        const mapped = await redis.get(userKey(session.sub));
        if (mapped === sid) {
            await redis.del(userKey(session.sub));
        }
    } catch (e) {
        console.warn("Failed to cleanup user mapping for session:", sid, e);
    }
}

/**
 * rotateSession
 * - Creates a fresh session for the same user (atomic in createSession),
 *   leaving no stale mapping behind.
 */
export async function rotateSession(_oldSid: string, data: SessionData): Promise<string> {
    const newSid = await createSession(data);

    try {
        if (_oldSid && _oldSid !== newSid) {
            await redis.del(sessKey(_oldSid));
        }
    } catch (e) {
        console.warn("rotateSession: failed to remove old sid", _oldSid, e);
    }

    return newSid;
}