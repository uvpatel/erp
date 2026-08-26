import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

export async function GET() {
  try {
    const [totalUsers, activeUsers, bannedUsers, roleCounts] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(user),
      db.select({ count: sql<number>`count(*)::int` }).from(user).where(sql`${user.banned} = false`),
      db.select({ count: sql<number>`count(*)::int` }).from(user).where(sql`${user.banned} = true`),
      db
        .select({
          role: user.role,
          count: sql<number>`count(*)::int`,
        })
        .from(user)
        .groupBy(user.role),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers[0]?.count || 0,
        activeUsers: activeUsers[0]?.count || 0,
        bannedUsers: bannedUsers[0]?.count || 0,
        roleCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}