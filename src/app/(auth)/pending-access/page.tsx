"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  LogOut,
  Mail,
  RefreshCw,
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
import { signOut, useSession } from "@/lib/auth-client";

export default function PendingAccessPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [checking, setChecking] = React.useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      await refetch();
      const res = await fetch("/api/auth/get-session");
      const sessionData = await res.json();
      const user = sessionData?.user as { role?: string; banned?: boolean } | undefined;

      if (user && user.role && user.role !== "pending" && !user.banned) {
        toast.success(`Access granted! Assigned role: ${user.role}`);
        router.push("/dashboard");
      } else {
        toast.info("Account is still awaiting administrator assignment.");
      }
    } catch {
      toast.error("Failed to check status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in");
          },
        },
      });
    } catch {
      router.push("/sign-in");
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 p-4 md:p-8">
      <div className="w-full max-w-lg">
        <Card className="border bg-card shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/5">
              <Clock className="size-7 animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-2xl font-bold">Access Pending</CardTitle>
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                Under Review
              </Badge>
            </div>
            <CardDescription className="text-sm max-w-sm mx-auto">
              Your account has been registered. An organization administrator needs to assign your role before you can access ERP workflows.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Account Details Pill */}
            {session?.user && (
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{session.user.name}</div>
                    <div className="text-muted-foreground">{session.user.email}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {(session.user as any)?.role || "Pending Role"}
                </Badge>
              </div>
            )}

            {/* Workflow Progress Steps */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Provisioning Stages
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground">1. Account Created & Verified</div>
                    <p className="text-muted-foreground">Credentials and email verification recorded.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-4 rounded-full border-2 border-amber-500 bg-amber-500/20 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="size-1.5 rounded-full bg-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-amber-700 dark:text-amber-300">
                      2. Administrator Role Assignment (Current)
                    </div>
                    <p className="text-muted-foreground">
                      An administrator will assign your access level (Sales, Purchase, Manufacturing, Inventory, Owner, or Admin).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-muted-foreground">
                  <div className="size-4 rounded-full border-2 border-muted flex items-center justify-center mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">3. Full ERP Dashboard Access</div>
                    <p>Access unlocked according to your assigned responsibilities.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={checkStatus}
                disabled={checking || isPending}
              >
                <RefreshCw className={`mr-2 size-4 ${checking ? "animate-spin" : ""}`} />
                {checking ? "Checking Approval..." : "Check Approval Status"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    window.location.href = "mailto:admin@company.com?subject=ERP%20Account%20Role%20Assignment%20Request";
                  }}
                >
                  <Mail className="mr-1.5 size-3.5" />
                  Contact Admin
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-1.5 size-3.5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-4 text-center text-xs text-muted-foreground">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Return to Homepage
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

