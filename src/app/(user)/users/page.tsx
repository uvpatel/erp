"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Boxes,
  Crown,
  Factory,
  Lock,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { USER_ROLES, UserRole } from "@/lib/types";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  roleCounts: Array<{ role: string; count: number }>;
}

const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  sales: ShoppingCart,
  purchase: ShoppingBag,
  manufacturing: Factory,
  inventory: Boxes,
  owner: Crown,
};

export default function AdminPage() {
  const {
    data: adminData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin");
      if (!res.ok) throw new Error("Failed to load admin statistics");
      const json = await res.json();
      return json.data as AdminStats;
    },
  });

  const countMap = React.useMemo(() => {
    const map = new Map<string, number>();
    adminData?.roleCounts?.forEach((r) => {
      map.set(r.role.toLowerCase(), r.count);
    });
    return map;
  }, [adminData]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-sm text-muted-foreground">
            System administration, user access provisioning, organizational roles, and security policies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
          >
            <RefreshCw
              className={`mr-2 size-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button size="sm" render={<Link href="/admin/users" />}>
            <UserPlus className="mr-2 size-4" />
            Manage Users
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Accounts
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{adminData?.totalUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Registered in database</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Access
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{adminData?.activeUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Operational accounts</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspended Accounts
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <UserX className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{adminData?.bannedUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Access revoked</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Defined Personas
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Shield className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 Roles</div>
            <p className="text-xs text-muted-foreground">System permission models</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections Navigation Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* User Management Hub Card */}
        <Card className="border bg-card shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Users className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">User Accounts</CardTitle>
                  <CardDescription>
                    Directory of employees and system access credentials
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">{adminData?.totalUsers || 0} Users</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add new staff members, assign role permissions, verify emails, or suspend account access when personnel changes occur.
            </p>
            <div className="pt-2">
              <Button className="w-full justify-between" render={<Link href="/admin/users" />}>
                <span>Manage All Users</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Roles & Permissions Hub Card */}
        <Card className="border bg-card shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Roles & Access Control</CardTitle>
                  <CardDescription>
                    Organizational duties & ERP permission matrix
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">6 Core Roles</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Inspect organizational role definitions, check permitted actions per module, and review user allocation.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full justify-between"
                render={<Link href="/admin/roles" />}
              >
                <span>View Permission Matrix</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution Summary */}
      <Card className="border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Role Allocation Summary
          </CardTitle>
          <CardDescription>
            Live breakdown of registered users across all organizational roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(USER_ROLES) as UserRole[]).map((roleKey) => {
              const def = USER_ROLES[roleKey];
              const Icon = roleIcons[roleKey] || Shield;
              const count = countMap.get(roleKey.toLowerCase()) || 0;

              return (
                <Link
                  key={roleKey}
                  href={`/admin/users?role=${roleKey}`}
                  className="flex items-center justify-between rounded-xl border bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-background text-primary shadow-xs">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{def.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {def.description}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {count} {count === 1 ? "User" : "Users"}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

