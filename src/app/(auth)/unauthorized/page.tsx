// src/app/unauthorized/page.tsx

import Link from "next/link"
import { ShieldX, ArrowLeft, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="size-7 text-destructive" />
          </div>

          <CardTitle className="text-2xl">
            Access Denied
          </CardTitle>

          <CardDescription className="max-w-sm">
            You&apos;re signed in, but your account doesn&apos;t have
            permission to access this page.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 ">
          <Button  className="w-full" variant="default">
            <Link href="/dashboard">
              <Home className="size-4" />
              Go to Dashboard
            </Link>
          </Button>

          <Button variant="outline" >
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}