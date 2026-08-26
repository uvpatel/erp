"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Boxes,
  CheckCircle2,
  Crown,
  Eye,
  Factory,
  Lock,
  Package,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Users,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRole } from "@/lib/types";

interface RoleItem {
  key: UserRole;
  label: string;
  description: string;
  responsibilities: string[];
  permissions: Record<string, string[]>;
  userCount: number;
}

const roleTheme: Record<
  UserRole,
  {
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    badgeVariant: "default" | "secondary" | "outline";
  }
> = {
  admin: {
    icon: ShieldCheck,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
    badgeVariant: "default",
  },
  sales: {
    icon: ShoppingCart,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    badgeVariant: "default",
  },
  purchase: {
    icon: ShoppingBag,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    badgeVariant: "default",
  },
  manufacturing: {
    icon: Factory,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    badgeVariant: "secondary",
  },
  inventory: {
    icon: Boxes,
    colorClass: "text-cyan-600 dark:text-cyan-400",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/30",
    badgeVariant: "outline",
  },
  owner: {
    icon: Crown,
    colorClass: "text-yellow-600 dark:text-yellow-400",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
    badgeVariant: "default",
  },
};

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<RoleItem | null>(null);

  const {
    data: rolesResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json() as Promise<{
        success: boolean;
        data: RoleItem[];
        meta: { totalRoles: number; totalUsers: number };
      }>;
    },
  });

  const roles = rolesResponse?.data || [];
  const meta = rolesResponse?.meta || { totalRoles: 6, totalUsers: 0 };

  const filteredRoles = React.useMemo(() => {
    if (!roles) return [];
    return roles.filter((r) => {
      const q = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        r.label.toLowerCase().includes(q) ||
        r.key.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.responsibilities.some((resp) => resp.toLowerCase().includes(q))
      );
    });
  }, [roles, searchQuery]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">
            Access control policies, operational responsibilities, and system permission matrix.
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
            <Users className="mr-2 size-4" />
            Manage Users
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Defined Roles
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meta.totalRoles}</div>
            <p className="text-xs text-muted-foreground">Standard ERP personas</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Active Users
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meta.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Assigned to system roles</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admin Accounts
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Lock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.find((r) => r.key === "admin")?.userCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Full system access privilege</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Operational Users
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles
                .filter((r) => r.key !== "admin")
                .reduce((acc, r) => acc + r.userCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Sales, Purchase, Mfg, Inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
        <Input
          placeholder="Search roles or responsibilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border bg-card shadow-xs">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
            </Card>
          ))
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No roles matched your search query.
          </div>
        ) : (
          filteredRoles.map((role) => {
            const theme = roleTheme[role.key] || roleTheme.sales;
            const Icon = theme.icon;

            return (
              <Card
                key={role.key}
                className="flex flex-col justify-between border bg-card shadow-xs transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 items-center justify-center rounded-lg ${theme.bgClass} ${theme.colorClass}`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">
                          {role.label}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono">
                          {role.key}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={theme.badgeVariant}>
                      {role.userCount} {role.userCount === 1 ? "User" : "Users"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  <div>
                    <span className="font-semibold text-foreground">
                      Core Responsibility:
                    </span>
                    <p className="mt-0.5 text-muted-foreground">
                      {role.description}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-foreground">
                      Key Capabilities:
                    </span>
                    <ul className="mt-1.5 space-y-1.5 text-muted-foreground">
                      {role.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <div className="flex items-center justify-between border-t p-4 pt-3 bg-muted/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedRole(role)}
                  >
                    <Eye className="mr-1.5 size-3.5 text-muted-foreground" />
                    View Permissions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    render={<Link href={`/admin/users?role=${role.key}`} />}
                  >
                    <Users className="mr-1.5 size-3.5" />
                    View Users
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Permissions Matrix Dialog */}
      <Dialog
        open={Boolean(selectedRole)}
        onOpenChange={(open) => !open && setSelectedRole(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedRole && (
                <div
                  className={`flex size-8 items-center justify-center rounded-md ${
                    roleTheme[selectedRole.key]?.bgClass
                  } ${roleTheme[selectedRole.key]?.colorClass}`}
                >
                  {React.createElement(roleTheme[selectedRole.key]?.icon || Shield, {
                    className: "size-4",
                  })}
                </div>
              )}
              <DialogTitle>
                {selectedRole?.label} — Permission Matrix
              </DialogTitle>
            </div>
            <DialogDescription>
              Detailed breakdown of module-level capabilities granted to the{" "}
              <span className="font-semibold">{selectedRole?.label}</span> role.
            </DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[160px]">ERP Module</TableHead>
                      <TableHead>Allowed Operations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(selectedRole.permissions).length > 0 ? (
                      Object.entries(selectedRole.permissions).map(
                        ([moduleKey, actions]) => (
                          <TableRow key={moduleKey}>
                            <TableCell className="font-semibold capitalize text-foreground">
                              {moduleKey}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1.5">
                                {actions.map((act) => (
                                  <Badge
                                    key={act}
                                    variant="outline"
                                    className="bg-background text-xs font-normal"
                                  >
                                    {act}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-muted-foreground"
                        >
                          No specific permissions assigned.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
                <p>
                  <strong>Role Key:</strong> <code>{selectedRole.key}</code>
                </p>
                <p className="mt-1">
                  <strong>Assigned Users:</strong> {selectedRole.userCount} active accounts currently possess this role.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

