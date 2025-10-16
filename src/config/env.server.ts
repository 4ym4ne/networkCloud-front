import { config as loadEnv } from "dotenv";
loadEnv(); // loads .env.local automatically in Node

import { z } from "zod";
import { urlValidator } from "./urlValidator";

const EnvServerSchema = z.object({
    // --- Keycloak ---
    KEYCLOAK_URL: urlValidator,
    KEYCLOAK_REALM: z.string(),
    KEYCLOAK_CLIENT_ID: z.string(),
    KEYCLOAK_CLIENT_SECRET: z.string().optional().nullable(),
    OIDC_REDIRECT_URI: urlValidator,

    // --- Spring / OPA ---
    SPRING_BASE_URL: urlValidator.optional(),
    API_GATEWAY_URL: urlValidator.optional(),
    OPA_URL: urlValidator.optional(),

    // --- Redis / Session ---
    REDIS_URL: z.string().optional(),
    SESSION_SECRET: z
        .string()
        .min(32, "SESSION_SECRET must be at least 32 characters long"),
    SESSION_TTL: z.coerce.number().int().positive().default(60 * 30),
});

export const envServer = EnvServerSchema.parse(process.env);
export type EnvServer = z.infer<typeof EnvServerSchema>;
