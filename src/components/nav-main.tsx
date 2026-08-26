"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { isUrlActive } from "@/lib/utils"

export interface NavSubItem {
  title: string
  url: string
}

export interface NavMainItem {
  title: string
  url: string
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode
  isActive?: boolean
  items?: NavSubItem[]
}

export interface NavMainProps {
  label?: string
  items: NavMainItem[]
}

function renderNavIcon(icon?: NavMainItem["icon"]) {
  if (!icon) return null
  if (React.isValidElement(icon)) {
    return icon
  }
  const IconComponent = icon as React.ComponentType<{ className?: string }>
  return <IconComponent className="size-4" />
}

function CollapsibleNavItem({
  item,
  pathname,
}: {
  item: NavMainItem
  pathname: string
}) {
  const isItemActive = React.useMemo(() => {
    if (typeof item.isActive === "boolean") return item.isActive
    if (isUrlActive(pathname, item.url)) return true
    return Boolean(
      item.items?.some((sub) => isUrlActive(pathname, sub.url))
    )
  }, [item, pathname])

  const [userToggledOpen, setUserToggledOpen] = React.useState<boolean | null>(null)
  const [prevActive, setPrevActive] = React.useState(isItemActive)

  if (prevActive !== isItemActive) {
    setPrevActive(isItemActive)
    setUserToggledOpen(null)
  }

  const isOpen = userToggledOpen ?? isItemActive

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setUserToggledOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              tooltip={item.title}
              isActive={isItemActive}
            />
          }
        >
          {renderNavIcon(item.icon)}
          <span>{item.title}</span>
          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => {
              const isSubActive = isUrlActive(pathname, subItem.url, true)
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    isActive={isSubActive}
                    render={<Link href={subItem.url} />}
                  >
                    <span>{subItem.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavMain({ label = "Platform", items }: NavMainProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = Boolean(item.items && item.items.length > 0)

          if (!hasSubItems) {
            const isSingleActive =
              item.isActive ?? isUrlActive(pathname, item.url)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isSingleActive}
                  render={<Link href={item.url} />}
                >
                  {renderNavIcon(item.icon)}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <CollapsibleNavItem
              key={item.title}
              item={item}
              pathname={pathname}
            />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}


