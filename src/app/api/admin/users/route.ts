import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const banned = searchParams.get("banned");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = (page - 1) * limit;

    // Single user lookup
    if (id) {
      const [foundUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1);

      if (!foundUser) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: foundUser,
      });
    }

    // List query with filters
    const conditions = [];

    if (role && role !== "ALL") {
      conditions.push(eq(user.role, role.toLowerCase()));
    }

    if (banned === "true") {
      conditions.push(eq(user.banned, true));
    } else if (banned === "false") {
      conditions.push(eq(user.banned, false));
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(user.name, q),
          ilike(user.email, q),
          ilike(user.role, q)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [usersList, [{ count }]] = await Promise.all([
      db
        .select()
        .from(user)
        .where(whereClause)
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(user)
        .where(whereClause),
    ]);

    return NextResponse.json({
      success: true,
      data: usersList,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role = "sales", emailVerified = true, image } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "User name is required" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check uniqueness
    const [existing] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email address already exists" },
        { status: 409 }
      );
    }

    const newUserId = crypto.randomUUID();

    const [newUser] = await db
      .insert(user)
      .values({
        id: newUserId,
        name: name.trim(),
        email: normalizedEmail,
        role: role.toLowerCase(),
        emailVerified: Boolean(emailVerified),
        image: image || null,
        banned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get("id") || body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required for update" },
        { status: 400 }
      );
    }

    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateFields.name = String(body.name).trim();
    if (body.email !== undefined) updateFields.email = String(body.email).trim().toLowerCase();
    if (body.role !== undefined) updateFields.role = String(body.role).toLowerCase();
    if (body.emailVerified !== undefined) updateFields.emailVerified = Boolean(body.emailVerified);
    if (body.image !== undefined) updateFields.image = body.image || null;
    if (body.banned !== undefined) {
      updateFields.banned = Boolean(body.banned);
      updateFields.banReason = body.banned ? body.banReason || "Administrative suspension" : null;
      updateFields.banExpires = body.banned && body.banExpires ? new Date(body.banExpires) : null;
    }

    const [updatedUser] = await db
      .update(user)
      .set(updateFields)
      .where(eq(user.id, id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const [deletedUser] = await db
      .delete(user)
      .where(eq(user.id, id))
      .returning({ id: user.id, email: user.email });

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User removed successfully",
      data: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
