"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Products Segment Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold">Failed to load Products</CardTitle>
          <CardDescription>
            An error occurred while loading catalog data or product specifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-center text-sm text-muted-foreground">
          <p className="rounded-md bg-muted p-2 font-mono text-xs text-foreground">
            {error.message || "An unexpected error occurred."}
          </p>
          {error.digest && (
            <p className="text-[10px] text-muted-foreground">Digest: {error.digest}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            <ArrowLeft className="mr-2 size-4" />
            Dashboard
          </Button>
          <Button size="sm" onClick={() => reset()}>
            <RefreshCw className="mr-2 size-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
