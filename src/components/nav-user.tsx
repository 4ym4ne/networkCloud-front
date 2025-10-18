"use client"

import { useRouter } from "next/navigation"
import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
  IconSettings,
  IconWallet,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSession } from "@/hooks/useSession"

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { user, logout, loading } = useSession()

  // Show loading state
  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="grid flex-1 gap-1">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // If no user, don't render anything
  if (!user) {
    return null
  }

  const handleLogout = async () => {
      logout()
    router.push("/")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg ring-2 ring-primary/10">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                  alt={user.username}
                />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.username}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email ?? `${user.username}@example.com`}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg ring-2 ring-primary/10">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                    alt={user.username}
                  />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.username}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email ?? `${user.username}@example.com`}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <IconUserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/wallet')} className="cursor-pointer">
                <IconWallet className="mr-2 h-4 w-4" />
                Wallet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <IconSettings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              <IconLogout className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
