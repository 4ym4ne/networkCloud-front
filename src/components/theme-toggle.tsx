"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

/**
 * A11y-friendly theme toggle compatible with shadcn/ui.
 * Uses next-themes under the hood.
 */
export function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) {
        // avoid hydration mismatch
        return (
            <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled />
        );
    }

    const active = theme === "system" ? systemTheme : theme;
    const isLight = active === "light";

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(isLight ? "dark" : "light")}
        >
            {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}