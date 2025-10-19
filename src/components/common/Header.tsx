"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    Menu,
    ChevronDown,
    TrendingUp,
    Wallet,
    Settings,
    LogOut,
    LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/auth/client";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, error, login, logout, loginInProgress } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { name: "Markets", href: "/markets", icon: TrendingUp },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Bets", href: "/bets", icon: TrendingUp },
        { name: "Wallet", href: "/wallet", icon: Wallet },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left section: brand */}
                <Link href="/" className="flex items-center gap-2 group">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        BetPlatform
                    </h1>
                    <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
                        Beta
                    </Badge>
                </Link>

                {/* Desktop navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    {loading ? (
                        <div className="flex items-center gap-2 px-3" aria-live="polite">
                            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" aria-hidden="true" />
                            <span className="hidden sm:inline text-sm text-muted-foreground">
                                Loading...
                            </span>
                        </div>
                    ) : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 rounded-full hover:bg-accent/50 pl-1.5 pr-4 py-1.5 transition-all hover:shadow-sm border border-transparent hover:border-border">
                                    <Avatar className="h-9 w-9 ring-2 ring-primary/10 ring-offset-2 ring-offset-background transition-all hover:ring-primary/30">
                                        <AvatarImage
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                                            alt={user.username}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm">
                                            {user.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden sm:flex flex-col items-start min-w-0">
                                        <span className="text-sm font-semibold leading-none mb-1 truncate max-w-[120px]">
                                            {user.username}
                                        </span>
                                        <span className="text-xs text-muted-foreground leading-none">
                                            My Account
                                        </span>
                                    </div>
                                    <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground/70 transition-transform group-hover:translate-y-0.5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{user.username}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {user.email ?? `${user.username}@example.com`}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/wallet')} className="cursor-pointer">
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Wallet
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => login()}
                                disabled={loginInProgress}
                                className="hidden sm:inline-flex"
                            >
                                Sign In
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => login()}
                                disabled={loginInProgress}
                                aria-disabled={loginInProgress}
                                aria-busy={loginInProgress}
                            >
                                {loginInProgress ? "Signing in..." : "Get Started"}
                            </Button>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80">
                            <SheetHeader>
                                <SheetTitle className="text-left">Navigation</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col space-y-1 mt-6">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {error && (
                <div className="border-t bg-destructive/10 px-4 py-2 text-center">
                    <p className="text-xs text-destructive" role="status" aria-live="polite">
                        {error}
                    </p>
                </div>
            )}
        </header>
    );
}
