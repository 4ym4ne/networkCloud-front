"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, error, login, logout, loginInProgress } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);

    // note: `useSession` handles loading/error internally; Header can react accordingly

    const navItems = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Projects", href: "/projects" },
        { name: "Reports", href: "/reports" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left section: brand */}
                <Link href="/" className="text-xl font-semibold text-primary">
                    MyApp
                </Link>

                {/* Desktop navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === item.href
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right section */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    {loading ? (
                        <div className="flex items-center gap-2 px-2" aria-live="polite">
                            <div className="h-8 w-8 rounded-full bg-muted/40" aria-hidden="true" />
                            <span className="hidden sm:inline text-sm text-muted-foreground">
                                Checking session…
                            </span>
                        </div>
                    ) : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-md hover:bg-accent p-2 transition">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                                            alt={user.username}
                                        />
                                        <AvatarFallback>
                                            {user.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline text-sm font-medium">
                    {user.username}
                  </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                                <div className="px-2 text-xs text-muted-foreground mb-2">
                                    {user.email ?? `${user.username}@example.com`}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => logout()} className="text-destructive">
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => login()}
                            disabled={loginInProgress}
                            aria-disabled={loginInProgress}
                            aria-busy={loginInProgress}
                        >
                            {loginInProgress ? "Signing in…" : "Login"}
                        </Button>
                    )}

                    {error && (
                        <div className="ml-2 text-xs text-destructive" role="status" aria-live="polite">
                            {error}
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileOpen((prev) => !prev)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                <div className="border-t bg-background md:hidden">
                    <nav className="flex flex-col space-y-2 px-6 py-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === item.href
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}