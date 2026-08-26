"use client"

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

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  hr: "HR",
  manager: "Manager",
  employee: "Employee",
  people: "People",
  attendance: "Attendance",
  approvals: "Approvals",
  organization: "Organization",
  departments: "Departments",
  designations: "Designations",
  "office-locations": "Office Locations",
  "time-off": "Time Off",
  payroll: "Payroll",
  settings: "Settings",
  profile: "Profile",
  notifications: "Notifications",
  reports: "Reports",
}

function formatSegment(segment: string) {
  // Use custom label if available
  if (routeLabels[segment]) {
    return routeLabels[segment]
  }

  // Otherwise automatically format the URL segment
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function AppBreadcrumb() {
  const pathname = usePathname()

  const segments = pathname
    .split("/")
    .filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink >
            <Link href="/dashboard">
              <Home className="size-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const isLast = index === segments.length - 1

          // Avoid rendering Dashboard twice
          if (segment === "dashboard") {
            return null
          }

          return (
            <div
              key={href}
              className="contents"
            >
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>
                    {formatSegment(segment)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink >
                    <Link href={href}>
                      {formatSegment(segment)}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}