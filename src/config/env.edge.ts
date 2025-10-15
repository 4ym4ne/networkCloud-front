import { z } from "zod";
import { urlValidator } from "./urlValidator";

const EnvEdgeSchema = z.object({
    KEYCLOAK_URL: urlValidator,
    KEYCLOAK_REALM: z.string().min(1),
    KEYCLOAK_CLIENT_ID: z.string().min(1),
    OIDC_REDIRECT_URI: urlValidator,
    SPRING_BASE_URL: urlValidator.optional(),
    OPA_URL: urlValidator.optional(),
});

export const envEdge = EnvEdgeSchema.parse(process.env);
export type EnvEdge = z.infer<typeof EnvEdgeSchema>;