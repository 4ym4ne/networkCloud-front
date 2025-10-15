// ✅ Clean, future-proof URL validator (Zod ≥3.23)
import { z } from "zod";

export const urlValidator = z
    .string()
    .min(1, "URL is required")
    .refine((value) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }, "Invalid URL format");
