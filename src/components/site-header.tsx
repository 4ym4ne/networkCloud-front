"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, Plus, RefreshCcw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">Dashboard</h1>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Live
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh Data
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Bet</span>
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="font-medium">Bet Won! 🎉</div>
                <div className="text-xs text-muted-foreground">
                  Your bet on Man Utd vs Chelsea won $145
                </div>
                <div className="text-xs text-muted-foreground">2 min ago</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="font-medium">Odds Changed</div>
                <div className="text-xs text-muted-foreground">
                  Liverpool odds dropped to 2.15
                </div>
                <div className="text-xs text-muted-foreground">15 min ago</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="font-medium">Deposit Confirmed</div>
                <div className="text-xs text-muted-foreground">
                  $500 added to your wallet
                </div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
