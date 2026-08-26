"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle,
  CheckCircle2,
  Edit2,
  Mail,
  MoreVertical,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USER_ROLES, UserRole } from "@/lib/types";

interface UserItem {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: UserRole;
  banned: boolean;
  banReason?: string | null;
  banExpires?: string | null;
  createdAt: string;
  updatedAt: string;
}

const roleBadgeThemes: Record<
  UserRole,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  admin: {
    label: "Admin",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/20",
    textClass: "text-purple-700 dark:text-purple-300",
    borderClass: "border-purple-500/30",
  },
  sales: {
    label: "Sales User",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
    textClass: "text-emerald-700 dark:text-emerald-300",
    borderClass: "border-emerald-500/30",
  },
  purchase: {
    label: "Purchase User",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/20",
    textClass: "text-blue-700 dark:text-blue-300",
    borderClass: "border-blue-500/30",
  },
  manufacturing: {
    label: "Manufacturing User",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/20",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-500/30",
  },
  inventory: {
    label: "Inventory Manager",
    bgClass: "bg-cyan-500/10 dark:bg-cyan-500/20",
    textClass: "text-cyan-700 dark:text-cyan-300",
    borderClass: "border-cyan-500/30",
  },
  owner: {
    label: "Business Owner",
    bgClass: "bg-yellow-500/10 dark:bg-yellow-500/20",
    textClass: "text-yellow-700 dark:text-yellow-300",
    borderClass: "border-yellow-500/30",
  },
};

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UsersPage() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "ALL";

  const queryClient = useQueryClient();
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>(
    initialRole.toUpperCase()
  );
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Create User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState<UserRole>("sales");
  const [newEmailVerified, setNewEmailVerified] = React.useState(true);

  // Edit User Modal State
  const [editingUser, setEditingUser] = React.useState<UserItem | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editRole, setEditRole] = React.useState<UserRole>("sales");
  const [editBanned, setEditBanned] = React.useState(false);

  // Fetch Users
  const {
    data: usersResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users?limit=100");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json() as Promise<{
        success: boolean;
        data: UserItem[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>;
    },
  });

  const users = usersResponse?.data || [];

  // Mutation: Create User
  const createUserMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      role: UserRole;
      emailVerified: boolean;
    }) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create user");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("User account created successfully!");
      setIsAddUserOpen(false);
      setNewName("");
      setNewEmail("");
      setNewRole("sales");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create user");
    },
  });

  // Mutation: Update User
  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<UserItem>;
    }) => {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update user");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("User updated successfully!");
      setEditingUser(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update user");
    },
  });

  // Mutation: Delete User
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete user");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("User removed successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete user");
    },
  });

  // Filtered Users
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchesRole =
        selectedRoleFilter === "ALL" ||
        u.role.toUpperCase() === selectedRoleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && !u.banned) ||
        (statusFilter === "BANNED" && u.banned);

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, selectedRoleFilter, statusFilter, searchQuery]);

  // KPI Metrics
  const kpis = React.useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => !u.banned).length;
    const banned = users.filter((u) => u.banned).length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total, active, banned, admins };
  }, [users]);

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditBanned(user.banned);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Please fill in both name and email");
      return;
    }
    createUserMutation.mutate({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      emailVerified: newEmailVerified,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      payload: {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        banned: editBanned,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage system access accounts, assign organizational roles, and enforce security policies.
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
          <Button size="sm" onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="mr-2 size-4" />
            Add New User
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Accounts
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.active}</div>
            <p className="text-xs text-muted-foreground">Operational in ERP</p>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admin Privilege
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.admins}</div>
            <p className="text-xs text-muted-foreground">Full system access</p>
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
            <div className="text-2xl font-bold">{kpis.banned}</div>
            <p className="text-xs text-muted-foreground">Access restricted</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                placeholder="Search user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="overflow-x-auto pb-1 lg:pb-0">
              <Tabs
                value={selectedRoleFilter}
                onValueChange={setSelectedRoleFilter}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 sm:grid-cols-7">
                  <TabsTrigger value="ALL">All</TabsTrigger>
                  <TabsTrigger value="ADMIN">Admin</TabsTrigger>
                  <TabsTrigger value="SALES">Sales</TabsTrigger>
                  <TabsTrigger value="PURCHASE">Purchase</TabsTrigger>
                  <TabsTrigger value="MANUFACTURING">Mfg</TabsTrigger>
                  <TabsTrigger value="INVENTORY">Inventory</TabsTrigger>
                  <TabsTrigger value="OWNER">Owner</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User Profile</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Assigned Role</TableHead>
                  <TableHead className="text-center">Account Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-44" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="mx-auto h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="size-8 text-muted-foreground/50" />
                        <p>No user accounts found matching your criteria.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRoleFilter("ALL");
                            setStatusFilter("ALL");
                            setSearchQuery("");
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const theme = roleBadgeThemes[user.role] || roleBadgeThemes.sales;

                    return (
                      <TableRow key={user.id} className="hover:bg-muted/40">
                        {/* Name & Avatar */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">
                                {user.name}
                              </div>
                              <div className="text-[11px] font-mono text-muted-foreground">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Mail className="size-3.5 text-muted-foreground" />
                            <span>{user.email}</span>
                            {user.emailVerified && (
                              <CheckCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                        </TableCell>

                        {/* Role Badge */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${theme.bgClass} ${theme.textClass} ${theme.borderClass}`}
                          >
                            {theme.label}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <Badge
                            variant={user.banned ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {user.banned ? "Suspended" : "Active"}
                          </Badge>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>

                        {/* Actions Dropdown */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                />
                              }
                            >
                              <MoreVertical className="size-4" />
                              <span className="sr-only">Actions</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(user)}
                              >
                                <Edit2 className="mr-2 size-4 text-muted-foreground" />
                                Edit & Assign Role
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  updateUserMutation.mutate({
                                    id: user.id,
                                    payload: { banned: !user.banned },
                                  })
                                }
                              >
                                {user.banned ? (
                                  <>
                                    <UserCheck className="mr-2 size-4 text-emerald-600" />
                                    Unsuspend Account
                                  </>
                                ) : (
                                  <>
                                    <Ban className="mr-2 size-4 text-amber-600" />
                                    Suspend Account
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => deleteUserMutation.mutate(user.id)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New ERP User</DialogTitle>
            <DialogDescription>
              Provision a new user account and assign their organizational role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Jane Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Email Address <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="e.g. jane.doe@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Assigned Role <span className="text-destructive">*</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Object.entries(USER_ROLES).map(([key, def]) => (
                  <option key={key} value={key}>
                    {def.label} — {def.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="emailVerified"
                checked={newEmailVerified}
                onChange={(e) => setNewEmailVerified(e.target.checked)}
                className="size-4 rounded border-input text-primary focus:ring-ring"
              />
              <label htmlFor="emailVerified" className="text-xs cursor-pointer">
                Mark email as verified immediately
              </label>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                <CheckCircle2 className="mr-1.5 size-4" />
                {createUserMutation.isPending ? "Creating User..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User & Role Dialog */}
      <Dialog
        open={Boolean(editingUser)}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User & Assign Role</DialogTitle>
            <DialogDescription>
              Update account profile and modify access permissions for{" "}
              <span className="font-semibold">{editingUser?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  System Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.entries(USER_ROLES).map(([key, def]) => (
                    <option key={key} value={key}>
                      {def.label} ({key}) — {def.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editBanned"
                  checked={editBanned}
                  onChange={(e) => setEditBanned(e.target.checked)}
                  className="size-4 rounded border-input text-destructive focus:ring-ring"
                />
                <label
                  htmlFor="editBanned"
                  className="text-xs text-destructive font-medium cursor-pointer"
                >
                  Suspend this account (prevent login and system access)
                </label>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  <CheckCircle2 className="mr-1.5 size-4" />
                  {updateUserMutation.isPending ? "Saving Changes..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

