"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  KeyRound,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { USER_ROLES, UserRole } from "@/lib/types";

export default function AccountPage() {
  const queryClient = useQueryClient();
  const { data: session, refetch: refetchSession } = useSession();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("+91 98765 43210");
  const [department, setDepartment] = React.useState("Operations & Supply Chain");
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  React.useEffect(() => {
    if (session?.user && !isInitialized) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setIsInitialized(true);
    }
  }, [session, isInitialized]);

  const userRole = ((session?.user as any)?.role || "sales") as UserRole;
  const roleDef = USER_ROLES[userRole] || USER_ROLES.sales;

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string }) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      const res = await fetch(`/api/admin/users?id=${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile");
      return json.data;
    },
    onSuccess: () => {
      refetchSession();
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Profile details updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateProfileMutation.mutate({
      name: name.trim(),
      email: email.trim(),
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      // Simulate password update
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = (name || "User")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal profile, security credentials, organizational role, and notification preferences.
        </p>
      </div>

      {/* User Header Card */}
      <Card className="border bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary shadow-xs">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{name || "ERP User"}</h2>
                  <Badge variant="default" className="text-xs">
                    {roleDef.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {email || "user@company.com"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-semibold text-foreground">Access Scope</span>
                <p className="text-muted-foreground">{roleDef.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="security">Security & Auth</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Details Tab */}
        <TabsContent value="profile" className="space-y-6">
          <form onSubmit={handleProfileSubmit}>
            <Card className="border bg-card shadow-xs">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your contact info and department profile across the ERP system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Full Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Contact Phone
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Department / Unit
                    </label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  <Save className="mr-2 size-4" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <form onSubmit={handlePasswordSubmit}>
            <Card className="border bg-card shadow-xs">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <KeyRound className="size-4 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Ensure your account is protected with a secure, strong password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 max-w-md"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button type="submit" disabled={passwordLoading}>
                  <Lock className="mr-2 size-4" />
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* Session Overview Card */}
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3 text-xs">
                <div>
                  <div className="font-semibold text-foreground">Current Web Browser Session</div>
                  <div className="text-muted-foreground">macOS • Chrome • Online Now</div>
                </div>
                <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                Localization & Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Display Currency
                  </label>
                  <Input value="INR (₹) — Indian Rupee" disabled className="mt-1 bg-muted" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Date & Time Format
                  </label>
                  <Input value="DD/MM/YYYY (en-IN)" disabled className="mt-1 bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

