// src/server/redis.ts
// **__ Shared Redis client (singleton, production-safe) __**

import { createClient } from "redis";
import { envServer as env } from "@/config/env.server";

let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * ✅ Create or reuse a single Redis client across the app
 */
export function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient({ url: env.REDIS_URL });

        redisClient.on("error", (err) => {
            console.error("❌ Redis connection error:", err);
        });

        redisClient
            .connect()
            .then(() => console.log("✅ Redis connected (shared instance)"))
            .catch((err) => console.error("❌ Redis connection failed:", err));
    }

    return redisClient;
}

// Export a shared reference immediately
export const redis = getRedisClient();
