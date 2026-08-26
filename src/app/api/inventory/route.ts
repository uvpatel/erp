import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  products,
  stockBalances,
  stockLocations,
  stockMovements,
  warehouses,
} from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const locationId = searchParams.get("locationId");
    const warehouseId = searchParams.get("warehouseId");
    const movementsOnly = searchParams.get("movements") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = (page - 1) * limit;

    // Fetch movements for a specific product
    if (productId && movementsOnly) {
      const movementsList = await db
        .select({
          id: stockMovements.id,
          movementNumber: stockMovements.movementNumber,
          productId: stockMovements.productId,
          quantity: stockMovements.quantity,
          movementType: stockMovements.movementType,
          referenceType: stockMovements.referenceType,
          referenceId: stockMovements.referenceId,
          unitCost: stockMovements.unitCost,
          performedBy: stockMovements.performedBy,
          occurredAt: stockMovements.occurredAt,
          createdAt: stockMovements.createdAt,
          fromLocation: {
            id: stockLocations.id,
            code: stockLocations.code,
            name: stockLocations.name,
          },
        })
        .from(stockMovements)
        .leftJoin(stockLocations, eq(stockMovements.fromLocationId, stockLocations.id))
        .where(eq(stockMovements.productId, productId))
        .orderBy(desc(stockMovements.occurredAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json({
        success: true,
        data: movementsList,
        pagination: { page, limit },
      });
    }

    // Default: List stock balances with product and location info
    const conditions = [];
    if (productId) conditions.push(eq(stockBalances.productId, productId));
    if (locationId) conditions.push(eq(stockBalances.locationId, locationId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const balances = await db
      .select({
        id: stockBalances.id,
        productId: stockBalances.productId,
        productName: products.name,
        productSku: products.sku,
        locationId: stockBalances.locationId,
        locationName: stockLocations.name,
        locationCode: stockLocations.code,
        warehouseName: warehouses.name,
        onHandQuantity: stockBalances.onHandQuantity,
        reservedQuantity: stockBalances.reservedQuantity,
        availableQuantity: sql<string>`(${stockBalances.onHandQuantity} - ${stockBalances.reservedQuantity})::text`,
        updatedAt: stockBalances.updatedAt,
      })
      .from(stockBalances)
      .innerJoin(products, eq(stockBalances.productId, products.id))
      .innerJoin(stockLocations, eq(stockBalances.locationId, stockLocations.id))
      .leftJoin(warehouses, eq(stockLocations.warehouseId, warehouses.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: balances,
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}