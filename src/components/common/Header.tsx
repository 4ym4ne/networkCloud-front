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
import { BellRing, History, LayoutDashboard, LogOut, Menu, Shield, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/auth/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "PCAP Upload", href: "/dashboard/pcap-upload", icon: UploadCloud },
  { name: "Analysis History", href: "/dashboard/history", icon: History },
  { name: "Notifications", href: "/dashboard/notifications", icon: BellRing },
] as const;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, login, logout, loginInProgress } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = user ? NAV_ITEMS : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-foreground">
          Network Cloud
        </Link>

        {user ? (
          <nav className="hidden items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-1 py-1 md:flex">
            {navItems.map(({ name, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden lg:inline">{name}</span>
                </Link>
              );
            })}
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {loading ? (
            <div className="flex items-center gap-2 px-3" aria-live="polite">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" aria-hidden="true" />
              <span className="hidden text-sm text-muted-foreground sm:inline">Loading…</span>
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-full border border-border/60 bg-background/90 px-2 py-1 transition hover:border-primary/40">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                      alt={user.username}
                    />
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden min-w-0 flex-col items-start sm:flex">
                    <span className="text-sm font-medium leading-none text-foreground truncate max-w-[120px]">
                      {user.username}
                    </span>
                    <span className="text-xs text-muted-foreground leading-none">
                      {user.email ?? "Authenticated user"}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-foreground">{user.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email ?? `${user.username}@example.com`}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")} className="cursor-pointer">
                  <BellRing className="mr-2 h-4 w-4" aria-hidden="true" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
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
                {loginInProgress ? "Signing in…" : "Get Started"}
              </Button>
            </div>
          )}

          {user ? (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left text-base font-semibold text-foreground">
                    Quick navigation
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col space-y-1">
                  {navItems.map(({ name, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/30",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {name}
                      </Link>
                    );
                  })}
                  <Link
                    href="/privacy"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30"
                  >
                    <Shield className="h-4 w-4" aria-hidden="true" />
                    Privacy & Terms
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
      </div>
    </header>
  );
}
