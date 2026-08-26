"use client"

import * as React from "react"
import {
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  Factory,
  FileClock,
  LayoutDashboard,
  Package,
  Settings2,
  ShoppingCart,
  Truck,
  Warehouse,
} from "lucide-react"

import { NavMain, type NavMainItem } from "@/components/nav-main"
import { NavProjects, type NavProjectItem } from "@/components/nav-projects"
import { NavUser, type NavUserData } from "@/components/nav-user"
import { TeamSwitcher, type Team } from "@/components/team-switcher"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export interface AppSidebarData {
  user: NavUserData
  teams: Team[]
  navMain: NavMainItem[]
  projects: NavProjectItem[]
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  data?: AppSidebarData
}

export const sidebarData: AppSidebarData = {
  user: {
    name: "ERP Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },

  teams: [
    {
      name: "Shiv Furniture",
      logo: Building2,
      plan: "Mini ERP",
    },
  ],

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      title: "Products",
      url: "/dashboard/products",
      icon: Package,
      items: [
        {
          title: "All Products",
          url: "/dashboard/products",
        },
        {
          title: "New Product",
          url: "/dashboard/products/new",
        },
      ],
    },

    {
      title: "Sales",
      url: "/dashboard/sales",
      icon: ShoppingCart,
      items: [
        {
          title: "Sales Orders",
          url: "/dashboard/sales",
        },
        {
          title: "Deliveries",
          url: "/dashboard/deliveries",
        },
        {
          title: "Vendors",
          url: "/dashboard/vendors",
        },
      ],
    },

    {
      title: "Purchase",
      url: "/dashboard/purchase",
      icon: Truck,
      items: [
        {
          title: "Purchase Orders",
          url: "/dashboard/purchase",
        },
        {
          title: "Vendors",
          url: "/dashboard/vendors",
        },
      ],
    },

    {
      title: "Manufacturing",
      url: "/dashboard/manufacturing",
      icon: Factory,
    },

    {
      title: "Inventory",
      url: "/dashboard/inventory",
      icon: Warehouse,
    },

    {
      title: "Administration",
      url: "/admin",
      icon: Settings2,
      items: [
        {
          title: "Admin Panel",
          url: "/admin",
        },
        {
          title: "Account",
          url: "/account",
        },
        {
          title: "Billing",
          url: "/billing",
        },
      ],
    },
  ],

  projects: [
    {
      name: "Procurement",
      url: "/dashboard/procurement",
      icon: ClipboardList,
    },
    {
      name: "Reports",
      url: "/reports",
      icon: ChartNoAxesCombined,
    },
    {
      name: "Data Library",
      url: "/data-library",
      icon: FileClock,
    },
  ],
}

export function AppSidebar({
  data = sidebarData,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}