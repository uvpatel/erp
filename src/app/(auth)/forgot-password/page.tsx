"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  RefreshCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";

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
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: "/reset-password",
        }),
      });
      setSubmitted(true);
      setResendCooldown(60);
      toast.success("Password reset instructions dispatched.");
    } catch (err: unknown) {
      console.warn("Forgot password request:", err);
      setSubmitted(true);
      setResendCooldown(60);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || !email) return;
    setLoading(true);
    try {
      await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: "/reset-password",
        }),
      });
      setResendCooldown(60);
      toast.success("New reset instructions sent.");
    } catch {
      setResendCooldown(60);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 p-4 md:p-8">
      <div className="w-full max-w-md">
        <Card className="border bg-card shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {submitted ? (
                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <KeyRound className="size-6" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {submitted ? "Check your email" : "Reset your password"}
            </CardTitle>
            <CardDescription className="text-sm">
              {submitted
                ? `We've sent a password recovery link to ${email}. Check your inbox and spam folders.`
                : "Enter your registered work email address below to receive password recovery instructions."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {submitted ? (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Mail className="size-4 text-primary" />
                    <span>Instructions dispatched</span>
                  </div>
                  <p>
                    Click the link in the email to set a new password. The reset link is valid for 60 minutes.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={loading || resendCooldown > 0}
                  >
                    {resendCooldown > 0 ? (
                      `Resend email in ${resendCooldown}s`
                    ) : (
                      <>
                        <RefreshCw className="mr-2 size-4" />
                        Resend Reset Email
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                  >
                    Try another email address
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-foreground">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    "Sending Instructions..."
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      Send Reset Instructions
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t pt-4 text-center text-xs text-muted-foreground">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
            >
              <ArrowLeft className="size-3.5" />
              Return to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

