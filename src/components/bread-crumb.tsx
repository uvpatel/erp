"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Route mapping specific to the Mini ERP application
export const routeLabels: Record<string, string> = {
  // Core ERP Modules
  dashboard: "Dashboard",
  inventory: "Inventory",
  manufacturing: "Manufacturing",
  products: "Products",
  procurement: "Procurement",
  purchase: "Purchase",
  sales: "Sales",
  deliveries: "Deliveries",
  vendors: "Vendors",
  orders: "Orders",

  // Inventory & Manufacturing sub-entities
  movements: "Stock Movements",
  boms: "Bills of Materials",
  bom: "BOM",
  "work-orders": "Work Orders",
  "work-centers": "Work Centers",
  warehouses: "Warehouses",
  locations: "Stock Locations",
  "stock-balances": "Stock Balances",
  reservations: "Stock Reservations",
  customers: "Customers",
  suppliers: "Suppliers",
  receipts: "Receipts",
  invoices: "Invoices",

  // CRUD actions & sub-views
  new: "New",
  create: "Create",
  edit: "Edit",
  details: "Details",
  overview: "Overview",
  history: "History",
  audit: "Audit Logs",
  cancel: "Cancel",

  // Admin & User settings
  admin: "Admin",
  account: "Account",
  profile: "Profile",
  billing: "Billing",
  settings: "Settings",
  help: "Help & Support",
  search: "Search",
  notification: "Notifications",
  notifications: "Notifications",
  reports: "Reports",
  "data-library": "Data Library",
  analytics: "Analytics",
  "pending-access": "Pending Access",
  "forgot-password": "Forgot Password",
  "sign-in": "Sign In",
  signup: "Sign Up",
}

// Acronyms to keep in uppercase
const ACRONYMS = new Set(["erp", "bom", "po", "so", "mo", "sku", "uom", "id", "api", "hr", "rfq"])

export function formatSegment(segment: string): string {
  const decoded = decodeURIComponent(segment).trim()
  const lower = decoded.toLowerCase()

  // 1. Direct dictionary match
  if (routeLabels[lower]) {
    return routeLabels[lower]
  }

  // 2. UUID pattern (e.g. 123e4567-e89b-12d3-a456-426614174000)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded)) {
    return `#${decoded.slice(0, 8)}`
  }

  // 3. Known ERP ID prefixes (e.g., del-101, po-2024, mo-55, so-99)
  const prefixedIdMatch = decoded.match(/^([a-zA-Z]{2,4})[-_](\d+|[a-zA-Z0-9]+)$/)
  if (prefixedIdMatch) {
    const [, prefix, id] = prefixedIdMatch
    return `${prefix.toUpperCase()}-${id}`
  }

  // 4. Long alphanumeric hash / CUID / NanoID (e.g., clyabcdef12345678)
  if (/^[a-zA-Z0-9_-]{16,}$/.test(decoded)) {
    return `#${decoded.slice(0, 8)}`
  }

  // 5. Numeric ID (e.g., 1042)
  if (/^\d+$/.test(decoded)) {
    return `#${decoded}`
  }

  // 6. Generic formatted words (replace hyphens/underscores and capitalize words/acronyms)
  return decoded
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const wordLower = word.toLowerCase()
      if (ACRONYMS.has(wordLower)) {
        return wordLower.toUpperCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}

interface AppBreadcrumbProps {
  className?: string
}

export function AppBreadcrumb({ className }: AppBreadcrumbProps) {
  const pathname = usePathname()

  const segments = pathname.split("/").filter(Boolean)
  const isDashboardRoot = pathname === "/dashboard" || pathname === "/"
  const displaySegments = segments[0] === "dashboard" ? segments.slice(1) : segments

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {isDashboardRoot ? (
          <BreadcrumbItem>
            <BreadcrumbPage className="inline-flex items-center gap-1.5 font-medium">
              <Home className="size-4" />
              <span>Dashboard</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link
                  href="/dashboard"
                  aria-label="Dashboard"
                  title="Dashboard"
                  className="inline-flex items-center"
                />
              }
            >
              <Home className="size-4" />
              <span className="sr-only">Dashboard</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}

        {!isDashboardRoot &&
          displaySegments.map((segment, index) => {
            const href =
              segments[0] === "dashboard"
                ? "/dashboard/" + displaySegments.slice(0, index + 1).join("/")
                : "/" + displaySegments.slice(0, index + 1).join("/")
            const isLast = index === displaySegments.length - 1
            const label = formatSegment(segment)

            return (
              <React.Fragment key={href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={
                        <Link href={href} />
                      }
                    >
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            )
          })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}