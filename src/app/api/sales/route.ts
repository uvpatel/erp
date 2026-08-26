import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db, withDatabaseTransaction } from "@/db";
import {
  customers,
  products,
  salesOrderLines,
  salesOrders,
  user,
} from "@/db/schema";
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

async function getOrCreateDefaultCustomerId(userId: string): Promise<string> {
  const existingCustomer = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.status, "ACTIVE"))
    .limit(1);

  if (existingCustomer.length > 0) {
    return existingCustomer[0].id;
  }

  const [newCustomer] = await db
    .insert(customers)
    .values({
      customerCode: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "Retail Walk-in Customer",
      email: "customer@erp.local",
      status: "ACTIVE",
      createdBy: userId,
    })
    .returning({ id: customers.id });

  return newCustomer.id;
}

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SO-${dateStr}-${randomSuffix}`;
}

const salesOrderLineInputSchema = z.object({
  productId: z.string().uuid("Valid product ID required"),
  description: z.string().optional(),
  orderedQuantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative").optional(),
  discountAmount: z.coerce.number().min(0).default(0),
  taxAmount: z.coerce.number().min(0).default(0),
});

const salesOrderCreateSchema = z.object({
  orderNumber: z.string().optional(),
  customerId: z.string().uuid("Valid customer ID required").optional(),
  customerName: z.string().optional(),
  orderDate: z.coerce.date().optional(),
  expectedDeliveryDate: z.coerce.date().optional().nullable(),
  currencyCode: z.string().length(3).default("INR"),
  notes: z.string().optional().nullable(),
  status: z
    .enum(["DRAFT", "CONFIRMED", "PARTIALLY_DELIVERED", "DELIVERED", "CANCELLED"])
    .default("DRAFT"),
  lines: z
    .array(salesOrderLineInputSchema)
    .min(1, "At least one order line is required")
    .optional(),
  items: z.array(salesOrderLineInputSchema).optional(),
});

const salesOrderPatchSchema = z.object({
  id: z.string().uuid().optional(),
  status: z
    .enum(["DRAFT", "CONFIRMED", "PARTIALLY_DELIVERED", "DELIVERED", "CANCELLED"])
    .optional(),
  notes: z.string().optional().nullable(),
  expectedDeliveryDate: z.coerce.date().optional().nullable(),
  currencyCode: z.string().length(3).optional(),
});

// GET: Fetch list of sales orders or single sales order by ?id= / ?orderNumber=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const orderNumber = searchParams.get("orderNumber");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    // Single order lookup
    if (id || orderNumber) {
      const condition = id
        ? eq(salesOrders.id, id)
        : eq(salesOrders.orderNumber, orderNumber!);

      const headerRows = await db
        .select({
          id: salesOrders.id,
          orderNumber: salesOrders.orderNumber,
          status: salesOrders.status,
          orderDate: salesOrders.orderDate,
          expectedDeliveryDate: salesOrders.expectedDeliveryDate,
          currencyCode: salesOrders.currencyCode,
          subtotal: salesOrders.subtotal,
          discountTotal: salesOrders.discountTotal,
          taxTotal: salesOrders.taxTotal,
          grandTotal: salesOrders.grandTotal,
          notes: salesOrders.notes,
          confirmedAt: salesOrders.confirmedAt,
          cancelledAt: salesOrders.cancelledAt,
          createdAt: salesOrders.createdAt,
          updatedAt: salesOrders.updatedAt,
          customer: {
            id: customers.id,
            code: customers.customerCode,
            name: customers.name,
            email: customers.email,
            phone: customers.phone,
            shippingAddressLine1: customers.shippingAddressLine1,
            shippingCity: customers.shippingCity,
            shippingState: customers.shippingState,
            shippingPostalCode: customers.shippingPostalCode,
          },
        })
        .from(salesOrders)
        .innerJoin(customers, eq(salesOrders.customerId, customers.id))
        .where(condition)
        .limit(1);

      if (headerRows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Sales order not found" },
          { status: 404 }
        );
      }

      const order = headerRows[0];

      // Fetch order lines with product info
      const lines = await db
        .select({
          id: salesOrderLines.id,
          productId: salesOrderLines.productId,
          sku: products.sku,
          productName: products.name,
          description: salesOrderLines.description,
          orderedQuantity: salesOrderLines.orderedQuantity,
          reservedQuantity: salesOrderLines.reservedQuantity,
          deliveredQuantity: salesOrderLines.deliveredQuantity,
          unitPrice: salesOrderLines.unitPrice,
          discountAmount: salesOrderLines.discountAmount,
          taxAmount: salesOrderLines.taxAmount,
          lineTotal: salesOrderLines.lineTotal,
          createdAt: salesOrderLines.createdAt,
        })
        .from(salesOrderLines)
        .innerJoin(products, eq(salesOrderLines.productId, products.id))
        .where(eq(salesOrderLines.salesOrderId, order.id))
        .orderBy(asc(salesOrderLines.createdAt), asc(salesOrderLines.id));

      return NextResponse.json({
        success: true,
        data: {
          ...order,
          lines,
        },
      });
    }

    // List query with filters
    const conditions = [];

    if (status && ["DRAFT", "CONFIRMED", "PARTIALLY_DELIVERED", "DELIVERED", "CANCELLED"].includes(status)) {
      conditions.push(
        eq(
          salesOrders.status,
          status as "DRAFT" | "CONFIRMED" | "PARTIALLY_DELIVERED" | "DELIVERED" | "CANCELLED"
        )
      );
    }

    if (customerId) {
      conditions.push(eq(salesOrders.customerId, customerId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(salesOrders.orderNumber, `%${search}%`),
          ilike(customers.name, `%${search}%`),
          ilike(customers.customerCode, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: salesOrders.id,
          orderNumber: salesOrders.orderNumber,
          status: salesOrders.status,
          orderDate: salesOrders.orderDate,
          expectedDeliveryDate: salesOrders.expectedDeliveryDate,
          currencyCode: salesOrders.currencyCode,
          subtotal: salesOrders.subtotal,
          discountTotal: salesOrders.discountTotal,
          taxTotal: salesOrders.taxTotal,
          grandTotal: salesOrders.grandTotal,
          notes: salesOrders.notes,
          confirmedAt: salesOrders.confirmedAt,
          cancelledAt: salesOrders.cancelledAt,
          createdAt: salesOrders.createdAt,
          updatedAt: salesOrders.updatedAt,
          customer: {
            id: customers.id,
            code: customers.customerCode,
            name: customers.name,
          },
        })
        .from(salesOrders)
        .innerJoin(customers, eq(salesOrders.customerId, customers.id))
        .where(whereClause)
        .orderBy(desc(salesOrders.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(salesOrders)
        .innerJoin(customers, eq(salesOrders.customerId, customers.id))
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
    console.error("Error fetching sales orders:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new sales order with lines
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = salesOrderCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const userId = await getAuthenticatedUserId(req);
    const customerId = data.customerId || (await getOrCreateDefaultCustomerId(userId));

    // Verify customer exists
    const customerExists = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (customerExists.length === 0) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    const inputLines = data.lines || data.items || [];
    if (inputLines.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one order line is required" },
        { status: 400 }
      );
    }

    // Verify products and fetch prices if needed
    const productIds = inputLines.map((l) => l.productId);
    const existingProducts = await db
      .select({
        id: products.id,
        name: products.name,
        salesPrice: products.salesPrice,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(existingProducts.map((p) => [p.id, p]));

    for (const line of inputLines) {
      if (!productMap.has(line.productId)) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${line.productId}` },
          { status: 404 }
        );
      }
    }

    // Calculate line totals and header accounting
    let subtotalNum = 0;
    let discountTotalNum = 0;
    let taxTotalNum = 0;

    const preparedLines = inputLines.map((line) => {
      const product = productMap.get(line.productId)!;
      const unitPrice =
        line.unitPrice !== undefined
          ? line.unitPrice
          : parseFloat(product.salesPrice || "0");
      const orderedQty = line.orderedQuantity;
      const gross = Number((orderedQty * unitPrice).toFixed(2));
      const discount = Number(Math.min(line.discountAmount || 0, gross).toFixed(2));
      const tax = Number((line.taxAmount || 0).toFixed(2));
      const lineTotal = Number((gross - discount + tax).toFixed(2));

      subtotalNum += gross;
      discountTotalNum += discount;
      taxTotalNum += tax;

      return {
        productId: line.productId,
        description: line.description || product.name,
        orderedQuantity: orderedQty.toFixed(4),
        reservedQuantity: "0.0000",
        deliveredQuantity: "0.0000",
        unitPrice: unitPrice.toFixed(2),
        discountAmount: discount.toFixed(2),
        taxAmount: tax.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
      };
    });

    subtotalNum = Number(subtotalNum.toFixed(2));
    discountTotalNum = Number(discountTotalNum.toFixed(2));
    taxTotalNum = Number(taxTotalNum.toFixed(2));
    const grandTotalNum = Number((subtotalNum - discountTotalNum + taxTotalNum).toFixed(2));

    const orderNumber = data.orderNumber || generateOrderNumber();
    const isConfirmed = data.status === "CONFIRMED";

    const result = await withDatabaseTransaction(async (tx) => {
      const [order] = await tx
        .insert(salesOrders)
        .values({
          orderNumber,
          customerId,
          status: data.status || "DRAFT",
          orderDate: data.orderDate || new Date(),
          expectedDeliveryDate: data.expectedDeliveryDate || null,
          currencyCode: data.currencyCode || "INR",
          subtotal: subtotalNum.toFixed(2),
          discountTotal: discountTotalNum.toFixed(2),
          taxTotal: taxTotalNum.toFixed(2),
          grandTotal: grandTotalNum.toFixed(2),
          notes: data.notes || null,
          confirmedAt: isConfirmed ? new Date() : null,
          confirmedBy: isConfirmed ? userId : null,
          createdBy: userId,
        })
        .returning();

      const insertedLines = await tx
        .insert(salesOrderLines)
        .values(
          preparedLines.map((line) => ({
            ...line,
            salesOrderId: order.id,
          }))
        )
        .returning();

      return { order, lines: insertedLines };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sales order created successfully",
        data: {
          ...result.order,
          lines: result.lines,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating sales order:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Full update of sales order header and lines
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get("id") || body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Sales Order ID is required" },
        { status: 400 }
      );
    }

    const parsed = salesOrderCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify existing order
    const existingOrder = await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, id))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sales order not found" },
        { status: 404 }
      );
    }

    const current = existingOrder[0];
    if (current.status === "DELIVERED" || current.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: `Cannot edit sales order in ${current.status} status` },
        { status: 400 }
      );
    }

    const customerId = data.customerId || current.customerId;
    const inputLines = data.lines || data.items || [];

    if (inputLines.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one order line is required" },
        { status: 400 }
      );
    }

    const productIds = inputLines.map((l) => l.productId);
    const existingProducts = await db
      .select({
        id: products.id,
        name: products.name,
        salesPrice: products.salesPrice,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(existingProducts.map((p) => [p.id, p]));

    let subtotalNum = 0;
    let discountTotalNum = 0;
    let taxTotalNum = 0;

    const preparedLines = inputLines.map((line) => {
      const product = productMap.get(line.productId);
      const unitPrice =
        line.unitPrice !== undefined
          ? line.unitPrice
          : parseFloat(product?.salesPrice || "0");
      const orderedQty = line.orderedQuantity;
      const gross = Number((orderedQty * unitPrice).toFixed(2));
      const discount = Number(Math.min(line.discountAmount || 0, gross).toFixed(2));
      const tax = Number((line.taxAmount || 0).toFixed(2));
      const lineTotal = Number((gross - discount + tax).toFixed(2));

      subtotalNum += gross;
      discountTotalNum += discount;
      taxTotalNum += tax;

      return {
        productId: line.productId,
        description: line.description || product?.name || "Item",
        orderedQuantity: orderedQty.toFixed(4),
        reservedQuantity: "0.0000",
        deliveredQuantity: "0.0000",
        unitPrice: unitPrice.toFixed(2),
        discountAmount: discount.toFixed(2),
        taxAmount: tax.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
      };
    });

    subtotalNum = Number(subtotalNum.toFixed(2));
    discountTotalNum = Number(discountTotalNum.toFixed(2));
    taxTotalNum = Number(taxTotalNum.toFixed(2));
    const grandTotalNum = Number((subtotalNum - discountTotalNum + taxTotalNum).toFixed(2));

    const result = await withDatabaseTransaction(async (tx) => {
      const [updatedOrder] = await tx
        .update(salesOrders)
        .set({
          customerId,
          expectedDeliveryDate: data.expectedDeliveryDate || null,
          currencyCode: data.currencyCode || current.currencyCode,
          subtotal: subtotalNum.toFixed(2),
          discountTotal: discountTotalNum.toFixed(2),
          taxTotal: taxTotalNum.toFixed(2),
          grandTotal: grandTotalNum.toFixed(2),
          notes: data.notes !== undefined ? data.notes : current.notes,
          updatedAt: new Date(),
        })
        .where(eq(salesOrders.id, id))
        .returning();

      // Delete existing lines and re-insert updated lines
      await tx
        .delete(salesOrderLines)
        .where(eq(salesOrderLines.salesOrderId, id));

      const newLines = await tx
        .insert(salesOrderLines)
        .values(
          preparedLines.map((line) => ({
            ...line,
            salesOrderId: id,
          }))
        )
        .returning();

      return { order: updatedOrder, lines: newLines };
    });

    return NextResponse.json({
      success: true,
      message: "Sales order updated successfully",
      data: {
        ...result.order,
        lines: result.lines,
      },
    });
  } catch (error) {
    console.error("Error updating sales order:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Partial update (e.g. status transition, notes, expected date)
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get("id") || body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Sales Order ID is required" },
        { status: 400 }
      );
    }

    const parsed = salesOrderPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const userId = await getAuthenticatedUserId(req);

    const existingOrder = await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, id))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sales order not found" },
        { status: 404 }
      );
    }

    const current = existingOrder[0];
    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.notes !== undefined) updateValues.notes = data.notes;
    if (data.expectedDeliveryDate !== undefined)
      updateValues.expectedDeliveryDate = data.expectedDeliveryDate;
    if (data.currencyCode !== undefined)
      updateValues.currencyCode = data.currencyCode;

    // Handle status transitions with check constraint compliance
    if (data.status && data.status !== current.status) {
      updateValues.status = data.status;

      if (data.status === "CONFIRMED") {
        updateValues.confirmedAt = new Date();
        updateValues.confirmedBy = userId;
      } else if (data.status === "CANCELLED") {
        updateValues.cancelledAt = new Date();
      } else if (data.status === "DRAFT") {
        updateValues.confirmedAt = null;
        updateValues.confirmedBy = null;
        updateValues.cancelledAt = null;
      } else if (data.status === "DELIVERED") {
        if (!current.confirmedAt) {
          updateValues.confirmedAt = new Date();
          updateValues.confirmedBy = userId;
        }
      }
    }

    const [updated] = await db
      .update(salesOrders)
      .set(updateValues)
      .where(eq(salesOrders.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Sales order updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error patching sales order:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a sales order
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const id = searchParams.get("id") || body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Sales Order ID is required" },
        { status: 400 }
      );
    }

    const existingOrder = await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, id))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sales order not found" },
        { status: 404 }
      );
    }

    const order = existingOrder[0];
    if (order.status === "DELIVERED") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete a delivered sales order. Cancel the order instead.",
        },
        { status: 400 }
      );
    }

    // Delete lines and order
    await withDatabaseTransaction(async (tx) => {
      await tx
        .delete(salesOrderLines)
        .where(eq(salesOrderLines.salesOrderId, id));

      await tx.delete(salesOrders).where(eq(salesOrders.id, id));
    });

    return NextResponse.json({
      success: true,
      message: "Sales order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sales order:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}