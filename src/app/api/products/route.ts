
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { products, stockBalances, unitsOfMeasure, user } from "@/db/schema";
import { auth } from "@/lib/auth";

async function getAuthenticatedUserId(req: NextRequest): Promise<string> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch {
    // Continue with fallback
  }

  const existingUser = await db
    .select({ id: user.id })
    .from(user)
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0].id;
  }

  // Create a default system admin user if none exists
  const systemUserId = "system-admin";
  await db
    .insert(user)
    .values({
      id: systemUserId,
      name: "System Admin",
      email: "admin@erp.local",
      role: "admin",
      emailVerified: true,
    })
    .onConflictDoNothing();

  return systemUserId;
}

// Ensure default UOM exists
async function getOrCreateDefaultUomId(): Promise<string> {
  const existingUom = await db
    .select({ id: unitsOfMeasure.id })
    .from(unitsOfMeasure)
    .where(eq(unitsOfMeasure.isActive, true))
    .limit(1);

  if (existingUom.length > 0) {
    return existingUom[0].id;
  }

  const [newUom] = await db
    .insert(unitsOfMeasure)
    .values({
      code: "UNIT",
      name: "Units",
      category: "QUANTITY",
      symbol: "pcs",
      precision: 0,
      isActive: true,
    })
    .returning({ id: unitsOfMeasure.id });

  return newUom.id;
}

const productCreateSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional().nullable(),
  productType: z.enum(["STORABLE", "CONSUMABLE", "SERVICE"]).default("STORABLE"),
  uomId: z.string().uuid().optional(),
  salesPrice: z.coerce.number().min(0).default(0),
  costPrice: z.coerce.number().min(0).default(0),
  trackInventory: z.boolean().default(true),
  active: z.boolean().default(true),
});

const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().uuid().optional(),
});

// GET: List products with inventory or fetch single product by ?id= / ?sku=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const sku = searchParams.get("sku");
    const search = searchParams.get("search");
    const productType = searchParams.get("type");
    const activeParam = searchParams.get("active");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = (page - 1) * limit;

    // Single product lookup
    if (id || sku) {
      const condition = id ? eq(products.id, id) : eq(products.sku, sku!);
      const rows = await db
        .select({
          id: products.id,
          sku: products.sku,
          name: products.name,
          description: products.description,
          productType: products.productType,
          salesPrice: products.salesPrice,
          costPrice: products.costPrice,
          trackInventory: products.trackInventory,
          active: products.active,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          uom: {
            id: unitsOfMeasure.id,
            code: unitsOfMeasure.code,
            name: unitsOfMeasure.name,
            symbol: unitsOfMeasure.symbol,
            precision: unitsOfMeasure.precision,
          },
        })
        .from(products)
        .leftJoin(unitsOfMeasure, eq(products.uomId, unitsOfMeasure.id))
        .where(condition)
        .limit(1);

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }

      // Get stock summary
      const stockSummary = await db
        .select({
          onHand: sql<string>`coalesce(sum(${stockBalances.onHandQuantity}), 0)::text`,
          reserved: sql<string>`coalesce(sum(${stockBalances.reservedQuantity}), 0)::text`,
        })
        .from(stockBalances)
        .where(eq(stockBalances.productId, rows[0].id));

      const onHand = parseFloat(stockSummary[0]?.onHand || "0");
      const reserved = parseFloat(stockSummary[0]?.reserved || "0");

      return NextResponse.json({
        success: true,
        data: {
          ...rows[0],
          stock: {
            onHand,
            reserved,
            available: Math.max(0, onHand - reserved),
          },
        },
      });
    }

    // List products
    const conditions = [];

    if (activeParam !== null) {
      conditions.push(eq(products.active, activeParam === "true"));
    }

    if (productType && ["STORABLE", "CONSUMABLE", "SERVICE"].includes(productType)) {
      conditions.push(
        eq(products.productType, productType as "STORABLE" | "CONSUMABLE" | "SERVICE")
      );
    }

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.sku, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: products.id,
          sku: products.sku,
          name: products.name,
          description: products.description,
          productType: products.productType,
          salesPrice: products.salesPrice,
          costPrice: products.costPrice,
          trackInventory: products.trackInventory,
          active: products.active,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          uom: {
            id: unitsOfMeasure.id,
            code: unitsOfMeasure.code,
            name: unitsOfMeasure.name,
            symbol: unitsOfMeasure.symbol,
            precision: unitsOfMeasure.precision,
          },
        })
        .from(products)
        .leftJoin(unitsOfMeasure, eq(products.uomId, unitsOfMeasure.id))
        .where(whereClause)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = productCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const userId = await getAuthenticatedUserId(req);
    const uomId = data.uomId || (await getOrCreateDefaultUomId());

    // Check for unique SKU
    const existingSku = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, data.sku))
      .limit(1);

    if (existingSku.length > 0) {
      return NextResponse.json(
        { success: false, error: `Product with SKU "${data.sku}" already exists` },
        { status: 409 }
      );
    }

    const isService = data.productType === "SERVICE";

    const [created] = await db
      .insert(products)
      .values({
        sku: data.sku.trim(),
        name: data.name.trim(),
        description: data.description || null,
        productType: data.productType,
        uomId,
        salesPrice: data.salesPrice.toFixed(2),
        costPrice: data.costPrice.toFixed(2),
        trackInventory: isService ? false : data.trackInventory,
        active: data.active,
        createdBy: userId,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Full update of product
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get("id") || body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const uomId = data.uomId || (await getOrCreateDefaultUomId());

    // Check SKU uniqueness if changed
    const existingWithSku = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.sku, data.sku), sql`${products.id} <> ${id}`))
      .limit(1);

    if (existingWithSku.length > 0) {
      return NextResponse.json(
        { success: false, error: `Product with SKU "${data.sku}" already exists` },
        { status: 409 }
      );
    }

    const isService = data.productType === "SERVICE";

    const [updated] = await db
      .update(products)
      .set({
        sku: data.sku.trim(),
        name: data.name.trim(),
        description: data.description || null,
        productType: data.productType,
        uomId,
        salesPrice: data.salesPrice.toFixed(2),
        costPrice: data.costPrice.toFixed(2),
        trackInventory: isService ? false : data.trackInventory,
        active: data.active,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Partial update of product
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get("id") || body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.sku !== undefined) {
      const existingWithSku = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.sku, data.sku), sql`${products.id} <> ${id}`))
        .limit(1);

      if (existingWithSku.length > 0) {
        return NextResponse.json(
          { success: false, error: `Product with SKU "${data.sku}" already exists` },
          { status: 409 }
        );
      }
      updateValues.sku = data.sku.trim();
    }

    if (data.name !== undefined) updateValues.name = data.name.trim();
    if (data.description !== undefined) updateValues.description = data.description;
    if (data.productType !== undefined) updateValues.productType = data.productType;
    if (data.uomId !== undefined) updateValues.uomId = data.uomId;
    if (data.salesPrice !== undefined) updateValues.salesPrice = data.salesPrice.toFixed(2);
    if (data.costPrice !== undefined) updateValues.costPrice = data.costPrice.toFixed(2);
    if (data.trackInventory !== undefined) updateValues.trackInventory = data.trackInventory;
    if (data.active !== undefined) updateValues.active = data.active;

    const [updated] = await db
      .update(products)
      .set(updateValues)
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product partially updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error partially updating product:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete or deactivate product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const id = searchParams.get("id") || body.id;
    const force = searchParams.get("force") === "true" || body.force === true;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (force) {
      const [deleted] = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning();

      if (!deleted) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Product deleted permanently",
        data: deleted,
      });
    }

    // Soft delete / deactivate by default
    const [deactivated] = await db
      .update(products)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    if (!deactivated) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deactivated successfully",
      data: deactivated,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}