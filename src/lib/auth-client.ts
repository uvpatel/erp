import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

import { ac, roles } from "@/lib/auth/permissions";

export const authClient = createAuthClient({
   plugins: [
    adminClient({
      ac,
      roles,
    }),
  ],
  baseURL: process.env.BETTER_AUTH_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
});

export const { signIn, signUp, signOut, useSession } = authClient;