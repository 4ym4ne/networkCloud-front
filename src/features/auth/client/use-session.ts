"use client";

import { useSessionContext } from "./session-provider";

export function useSession() {
    return useSessionContext();
}
