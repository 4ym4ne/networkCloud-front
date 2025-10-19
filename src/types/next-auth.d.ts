import type { DefaultSession } from "next-auth";
import type { UserProfile } from "@/features/auth/shared/user-profile";

declare module "next-auth" {
    interface Session {
        user: (DefaultSession["user"] & {
            sub?: string;
            username?: string;
            roles?: string[];
        }) | null;
        userProfile?: UserProfile;
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
        csrfToken?: string;
        idToken?: string;
        error?: string;
    }

    interface User {
        sub?: string;
        username?: string;
        roles?: string[];
        profile?: UserProfile;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
        idToken?: string;
        roles?: string[];
        username?: string;
        sub?: string;
        csrfToken?: string;
        error?: string;
        userProfile?: UserProfile;
    }
}
