"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { History as HistoryIcon, ShieldAlert } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/notifications/notification-bell"

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
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/dashboard/history">
              <HistoryIcon className="h-4 w-4" />
              History
            </Link>
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />
          <NotificationBell />

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
