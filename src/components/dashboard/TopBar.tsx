"use client";

import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";

export default function TopBar({ className }: { className?: string }) {
  const { user, loading, login, logout, loginInProgress } = useSession();

  return (
    <div className={cn("flex h-16 items-center justify-between px-4", className)}>
      <div className="flex items-center gap-4">
        <h1 className="hidden md:inline text-sm font-medium text-muted-foreground">
          Dashboard
        </h1>
        <div className="relative w-64">
          <input
            aria-label="Search markets"
            placeholder="Search markets or teams..."
            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {loading ? (
          <div className="h-8 w-8 rounded-full bg-muted/30" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <div className="text-right mr-2 hidden sm:block">
              <div className="text-sm font-medium">{user.username}</div>
              <div className="text-xs text-muted-foreground">{user.email ?? ''}</div>
            </div>

            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} alt={user.username} />
              <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <Button variant="ghost" size="sm" onClick={() => logout()}>Logout</Button>
          </div>
        ) : (
          <Button onClick={() => login()} disabled={loginInProgress}>{loginInProgress ? 'Signing in…' : 'Login'}</Button>
        )}
      </div>
    </div>
  );
}
