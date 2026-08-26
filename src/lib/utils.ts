import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isUrlActive(
  pathname: string,
  targetUrl?: string,
  exact = false
): boolean {
  if (!targetUrl || !pathname) return false

  const cleanPath = pathname.split(/[?#]/)[0].replace(/\/+$/, "") || "/"
  const cleanTarget = targetUrl.split(/[?#]/)[0].replace(/\/+$/, "") || "/"

  if (cleanTarget === "/dashboard" || cleanTarget === "/") {
    return cleanPath === cleanTarget
  }

  if (exact) {
    return cleanPath === cleanTarget
  }

  return cleanPath === cleanTarget || cleanPath.startsWith(cleanTarget + "/")
}

