"use client"

import * as React from "react"
import {
  BoxesIcon,
  ChartNoAxesCombinedIcon,
  ClipboardListIcon,
  FactoryIcon,
  FileClockIcon,
  LayoutDashboardIcon,
  PackageIcon,
  Settings2Icon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TruckIcon,
  UsersIcon,
  WarehouseIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "ERP Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },

    {
      title: "Products",
      url: "/dashboard/products",
      icon: <PackageIcon />,
      items: [
        {
          title: "All Products",
          url: "/dashboard/products",
        },
        {
          title: "Create Product",
          url: "/dashboard/products/new",
        },
      ],
    },

    {
      title: "Sales",
      url: "/dashboard/sales",
      icon: <ShoppingCartIcon />,
      items: [
        {
          title: "Sales Orders",
          url: "/dashboard/sales/orders",
        },
        {
          title: "Deliveries",
          url: "/dashboard/sales/deliveries",
        },
        {
          title: "Customers",
          url: "/dashboard/sales/customers",
        },
      ],
    },

    {
      title: "Purchase",
      url: "/dashboard/purchase",
      icon: <TruckIcon />,
      items: [
        {
          title: "Purchase Orders",
          url: "/dashboard/purchase/orders",
        },
        {
          title: "Receipts",
          url: "/dashboard/purchase/receipts",
        },
        {
          title: "Vendors",
          url: "/dashboard/purchase/vendors",
        },
      ],
    },

    {
      title: "Manufacturing",
      url: "/dashboard/manufacturing",
      icon: <FactoryIcon />,
      items: [
        {
          title: "Manufacturing Orders",
          url: "/dashboard/manufacturing/orders",
        },
        {
          title: "Work Orders",
          url: "/dashboard/manufacturing/work-orders",
        },
        {
          title: "Bills of Materials",
          url: "/dashboard/manufacturing/boms",
        },
        {
          title: "Work Centers",
          url: "/dashboard/manufacturing/work-centers",
        },
      ],
    },

    {
      title: "Inventory",
      url: "/dashboard/inventory",
      icon: <WarehouseIcon />,
      items: [
        {
          title: "Stock Overview",
          url: "/dashboard/inventory/stock",
        },
        {
          title: "Stock Movements",
          url: "/dashboard/inventory/movements",
        },
        {
          title: "Reservations",
          url: "/dashboard/inventory/reservations",
        },
        {
          title: "Adjustments",
          url: "/dashboard/inventory/adjustments",
        },
        {
          title: "Warehouses",
          url: "/dashboard/inventory/warehouses",
        },
      ],
    },

    {
      title: "Procurement",
      url: "/dashboard/procurement",
      icon: <ClipboardListIcon />,
      items: [
        {
          title: "Procurement Requests",
          url: "/dashboard/procurement/requests",
        },
        {
          title: "Procurement Rules",
          url: "/dashboard/procurement/rules",
        },
      ],
    },
  ],

  insights: [
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: <ChartNoAxesCombinedIcon />,
    },
    {
      title: "Audit Logs",
      url: "/dashboard/audit-logs",
      icon: <FileClockIcon />,
    },
  ],

  navSecondary: [
    {
      title: "Users & Access",
      url: "/dashboard/admin/users",
      icon: <UsersIcon />,
    },
    {
      title: "Roles & Permissions",
      url: "/dashboard/admin/roles",
      icon: <ShieldCheckIcon />,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings2Icon />,
    },
  ],
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/dashboard" />}
            >
              <BoxesIcon className="size-5!" />

              <span className="text-base font-semibold">
                Mini ERP
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />

        <NavSecondary items={data.insights} />

        <NavSecondary
          items={data.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}