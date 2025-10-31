"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCloudUpload, type Icon } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon?: Icon;
};

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Upload a PCAP"
              className="min-w-8 bg-primary text-primary-foreground transition duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground"
              asChild
            >
              <Link href="/dashboard/pcap-upload" className="flex items-center gap-2">
                <IconCloudUpload />
                <span>Upload a PCAP</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isNavigable = Boolean(item.url && item.url !== "#");
            const isActive =
              isNavigable &&
              (item.url === "/dashboard"
                ? pathname === item.url
                : pathname.startsWith(item.url));

            const content = (
              <>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </>
            );

            return (
              <SidebarMenuItem key={item.title}>
                {isNavigable ? (
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    isActive={isActive}
                  >
                    <Link href={item.url} className="flex items-center gap-2">
                      {content}
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                    {content}
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
