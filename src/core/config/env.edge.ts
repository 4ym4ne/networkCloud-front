import { z } from "zod";
import { urlValidator } from "./url-validator";

const EnvEdgeSchema = z.object({
    KEYCLOAK_URL: urlValidator,
    KEYCLOAK_REALM: z.string().min(1),
    KEYCLOAK_CLIENT_ID: z.string().min(1),
    OIDC_REDIRECT_URI: urlValidator,
    SPRING_BASE_URL: urlValidator.optional(),
    OPA_URL: urlValidator.optional(),
    NEXT_PUBLIC_NOTIFICATIONS_WS_URL: urlValidator
        .refine((value) => value.startsWith("ws"), "Must be a ws:// or wss:// URL")
        .optional(),
});

export const envEdge = EnvEdgeSchema.parse(process.env);
export type EnvEdge = z.infer<typeof EnvEdgeSchema>;
