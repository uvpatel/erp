import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { statement } from "@/lib/auth/permissions";
import { USER_ROLES, UserRole } from "@/lib/types";

const ROLE_PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
  admin: {
    product: ["Read", "Create", "Update", "Delete"],
    sales: ["Read", "Create", "Update", "Delete", "Confirm", "Deliver", "Cancel"],
    purchase: ["Read", "Create", "Update", "Delete", "Confirm", "Receive", "Cancel"],
    manufacturing: ["Read", "Create", "Update", "Delete", "Confirm", "Start", "Complete", "Cancel"],
    inventory: ["Read", "Adjust", "Reserve", "Release", "Transfer"],
    bom: ["Read", "Create", "Update", "Delete"],
    procurement: ["Read", "Create", "Manage"],
    dashboard: ["Read"],
    audit: ["Read"],
    user: ["Read", "Create", "Update", "Delete", "Assign Role"],
  },
  sales: {
    product: ["Read"],
    sales: ["Read", "Create", "Update", "Confirm", "Deliver", "Cancel"],
    inventory: ["Read"],
    dashboard: ["Read"],
  },
  purchase: {
    product: ["Read"],
    purchase: ["Read", "Create", "Update", "Confirm", "Receive", "Cancel"],
    inventory: ["Read"],
    procurement: ["Read"],
    dashboard: ["Read"],
  },
  manufacturing: {
    product: ["Read"],
    manufacturing: ["Read", "Create", "Update", "Confirm", "Start", "Complete", "Cancel"],
    inventory: ["Read", "Reserve", "Release"],
    bom: ["Read"],
    procurement: ["Read"],
    dashboard: ["Read"],
  },
  inventory: {
    product: ["Read"],
    inventory: ["Read", "Adjust", "Reserve", "Release", "Transfer"],
    dashboard: ["Read"],
  },
  owner: {
    product: ["Read", "Create", "Update", "Delete"],
    sales: ["Read"],
    purchase: ["Read"],
    manufacturing: ["Read"],
    inventory: ["Read"],
    bom: ["Read"],
    procurement: ["Read"],
    dashboard: ["Read"],
    audit: ["Read"],
  },
};

export async function GET() {
  try {
    // Query active user counts grouped by role
    const counts = await db
      .select({
        role: user.role,
        count: sql<number>`count(*)::int`,
      })
      .from(user)
      .groupBy(user.role);

    const countMap = new Map<string, number>();
    counts.forEach((c) => {
      countMap.set(c.role.toLowerCase(), c.count);
    });

    const rolesList = (Object.keys(USER_ROLES) as UserRole[]).map((roleKey) => {
      const def = USER_ROLES[roleKey];
      const userCount = countMap.get(roleKey.toLowerCase()) || 0;
      const permissions = ROLE_PERMISSIONS[roleKey] || {};

      return {
        key: roleKey,
        label: def.label,
        description: def.description,
        responsibilities: def.responsibilities,
        permissions,
        userCount,
      };
    });

    const totalUsers = counts.reduce((acc, c) => acc + c.count, 0);

    return NextResponse.json({
      success: true,
      data: rolesList,
      meta: {
        totalRoles: rolesList.length,
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
