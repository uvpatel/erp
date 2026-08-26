"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export interface NavSecondaryItem {
  title: string
  url: string
  icon: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode
  badge?: React.ReactNode
}

export interface NavSecondaryProps
  extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  label?: string
  items: NavSecondaryItem[]
}

export function NavSecondary({
  label,
  items,
  ...props
}: NavSecondaryProps) {
  const pathname = usePathname()

  const renderIcon = (icon: NavSecondaryItem["icon"]) => {
    if (!icon) return null
    if (React.isValidElement(icon)) {
      return icon
    }
    const IconComponent = icon as React.ComponentType<{ className?: string }>
    return <IconComponent className="size-4" />
  }

  return (
    <SidebarGroup {...props}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={pathname === item.url}
                render={<Link href={item.url} />}
              >
                {renderIcon(item.icon)}
                <span>{item.title}</span>
                {item.badge}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

