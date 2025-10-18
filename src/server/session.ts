// src/server/session.ts
// Server-side session management using Redis (signed + encrypted payloads)

import crypto from "crypto";
import { SignJWT, jwtVerify, JWTPayload, CompactEncrypt, compactDecrypt } from "jose";
import { envServer as env } from "@/config/env.server";
import { redis } from "@/server/redis"; // shared Redis client
import { logger } from "@/lib/logger";

// TTL in seconds (default from env)
const SESSION_TTL = env.SESSION_TTL ?? 60 * 60 * 24 * 7;

export interface SessionData {
    sub: string;            // Keycloak user ID
    username: string;       // Username
    access_token: string;   // Access token
    refresh_token?: string; // Refresh token
    id_token?: string;      // ID token (for logout hint)
    roles?: string[];       // User roles
    expires_at: number;     // access token expiry (epoch ms)
}

// Helper key builders
export const sessKey = (sid: string) => `sess:${sid}`;
export const userKey = (sub: string) => `user:${sub}`;

// -- Cryptographic key material --
// Best practice: separate signing and encryption keys. Derive subkeys from the
// canonical master `SESSION_SECRET` using HKDF so operators can keep a single
// secret while still getting key separation.

// `env` is produced by EnvServerSchema.parse(process.env) in `env.server.ts`.
// That schema enforces that SESSION_SECRET exists and is at least 32 chars,
// so it's safe to assert its presence here for TypeScript.
const MASTER_SECRET = Buffer.from(env.SESSION_SECRET!, "utf8");
// Derive a 32-byte signing key (for HS256) and a 32-byte encryption key (for A256GCM)
const SIGNING_KEY_BYTES = Buffer.from(
    crypto.hkdfSync("sha256", MASTER_SECRET, Buffer.from("session-sign-salt"), Buffer.from("session-sign"), 32)
);
const ENCRYPTION_KEY_BYTES = Buffer.from(
    crypto.hkdfSync("sha256", MASTER_SECRET, Buffer.from("session-enc-salt"), Buffer.from("session-enc"), 32)
);

// Key materials in forms usable by `jose`
const JWT_SECRET = crypto.createSecretKey(SIGNING_KEY_BYTES); // KeyObject accepted by jose for HMAC
const ENC_KEY = crypto.createSecretKey(ENCRYPTION_KEY_BYTES);

// JWE helpers (uses jose CompactEncrypt / compactDecrypt)
export async function jweEncrypt(plain: string): Promise<string> {
    // Protect header includes alg=dir (direct symmetric) and AES-GCM enc
    return await new CompactEncrypt(Buffer.from(plain, "utf8"))
        .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWE" })
        .encrypt(ENC_KEY);
}

export async function jweDecrypt(token: string): Promise<string> {
    const { plaintext } = await compactDecrypt(token, ENC_KEY);
    return Buffer.from(plaintext).toString("utf8");
}

// Helpers to sign/verify JWS (exposed for tests)
export async function signPayload(data: SessionData): Promise<string> {
    return await new SignJWT(data as unknown as JWTPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL)
        .sign(JWT_SECRET);
}

export async function verifyJWS(token: string): Promise<SessionData> {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionData;
}

/**
 * createSession
 * - Signs session payload with JWS (HS256) and encrypts it with JWE (A256GCM)
 * - Stores encrypted blob under `sess:{sid}` and reverse mapping `user:{sub}` -> sid
 * - Uses WATCH/MULTI to atomically set both keys and delete any previous session for the user
 */
export async function createSession(data: SessionData): Promise<string> {
    const sid = crypto.randomUUID();

    // Sign payload into a compact JWS (HMAC-SHA256)
    const token = await new SignJWT(data as unknown as JWTPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL)
        .sign(JWT_SECRET);

    // Encrypt the signed JWS using JWE (Compact Serialization)
    const encrypted = await jweEncrypt(token);

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
            logger.error("Failed to create session in Redis (attempt):", err);
            throw err;
        }
    }

    throw new Error("Failed to create session after concurrent updates");
}

/**
 * getSession
 * - Reads encrypted blob from Redis, decrypts it (JWE), verifies the JWS and returns SessionData
 */
export async function getSession(sid: string): Promise<SessionData | null> {
    if (!sid) return null;

    const raw = await redis.get(sessKey(sid));
    if (!raw) return null;

    try {
        const jws = await jweDecrypt(raw);
        const { payload } = await jwtVerify(jws, JWT_SECRET);
        return payload as unknown as SessionData;
    } catch (err) {
        logger.warn("Failed to decrypt/verify session payload (will delete):", sid, err);
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
        logger.warn("Failed to delete session payload:", sid, e);
    }

    if (!session) return;

    // If the current mapping for the user still points to this sid, remove it.
    try {
        const mapped = await redis.get(userKey(session.sub));
        if (mapped === sid) {
            await redis.del(userKey(session.sub));
        }
    } catch (e) {
        logger.warn("Failed to cleanup user mapping for session:", sid, e);
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
        logger.warn("rotateSession: failed to remove old sid", _oldSid, e);
    }

    return newSid;
}