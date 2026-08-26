import {
  and,
  asc,
  desc,
  eq,
  gt,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "../index";
import { stockBalances } from "../schema/inventory/stock-balances.schema";
import { stockLocations } from "../schema/inventory/stock-locations.schema";
import { stockMovements } from "../schema/inventory/stock-movements.schema";
import { boms } from "../schema/manufacturing/boms.schema";
import { manufacturingComponents } from "../schema/manufacturing/manufacturing-components.schema";
import { manufacturingOrders } from "../schema/manufacturing/manufacturing-orders.schema";
import { workCenters } from "../schema/manufacturing/work-centers.schema";
import { workOrders } from "../schema/manufacturing/work-orders.schema";
import { customers } from "../schema/partners/customers.schema";
import { vendors } from "../schema/partners/vendors.schema";
import { products } from "../schema/products/products.schema";
import { unitsOfMeasure } from "../schema/products/units-of-measure.schema";
import { purchaseOrderLines } from "../schema/purchase/purchase-order-lines.schema";
import { purchaseOrders } from "../schema/purchase/purchase-orders.schema";
import { salesOrderLines } from "../schema/sales/sales-order-lines.schema";
import { salesOrders } from "../schema/sales/sales-orders.schema";

const MAX_PAGE_SIZE = 100;

function pageSize(requested = 50) {
  return Math.min(Math.max(Math.trunc(requested), 1), MAX_PAGE_SIZE);
}

export interface CreatedAtCursor {
  createdAt: Date;
  id: string;
}

export async function listProductsWithInventory(options: {
  cursor?: CreatedAtCursor;
  limit?: number;
  includeInactive?: boolean;
} = {}) {
  const limit = pageSize(options.limit);
  const inventoryTotals = db
    .select({
      productId: stockBalances.productId,
      onHandQuantity:
        sql<string>`coalesce(sum(${stockBalances.onHandQuantity}), 0)::text`.as(
          "on_hand_quantity",
        ),
      reservedQuantity:
        sql<string>`coalesce(sum(${stockBalances.reservedQuantity}), 0)::text`.as(
          "reserved_quantity",
        ),
    })
    .from(stockBalances)
    .groupBy(stockBalances.productId)
    .as("inventory_totals");

  const cursorFilter = options.cursor
    ? or(
        gt(products.createdAt, options.cursor.createdAt),
        and(
          eq(products.createdAt, options.cursor.createdAt),
          gt(products.id, options.cursor.id),
        ),
      )
    : undefined;
  const activeFilter = options.includeInactive
    ? undefined
    : eq(products.active, true);

  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      description: products.description,
      productType: products.productType,
      uom: {
        id: unitsOfMeasure.id,
        code: unitsOfMeasure.code,
        name: unitsOfMeasure.name,
        symbol: unitsOfMeasure.symbol,
        precision: unitsOfMeasure.precision,
      },
      salesPrice: products.salesPrice,
      costPrice: products.costPrice,
      trackInventory: products.trackInventory,
      active: products.active,
      onHandQuantity:
        sql<string>`coalesce(${inventoryTotals.onHandQuantity}, '0')`.as(
          "on_hand_quantity",
        ),
      reservedQuantity:
        sql<string>`coalesce(${inventoryTotals.reservedQuantity}, '0')`.as(
          "reserved_quantity",
        ),
      availableQuantity:
        sql<string>`(
          coalesce(${inventoryTotals.onHandQuantity}, '0')::numeric
          - coalesce(${inventoryTotals.reservedQuantity}, '0')::numeric
        )::text`.as("available_quantity"),
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .innerJoin(unitsOfMeasure, eq(products.uomId, unitsOfMeasure.id))
    .leftJoin(inventoryTotals, eq(products.id, inventoryTotals.productId))
    .where(and(activeFilter, cursorFilter))
    .orderBy(asc(products.createdAt), asc(products.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);

  return {
    items,
    nextCursor:
      hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
  };
}

export async function getSalesOrderDetails(orderId: string) {
  const headerQuery = db
    .select({
      id: salesOrders.id,
      orderNumber: salesOrders.orderNumber,
      status: salesOrders.status,
      customer: {
        id: customers.id,
        code: customers.customerCode,
        name: customers.name,
      },
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
    })
    .from(salesOrders)
    .innerJoin(customers, eq(salesOrders.customerId, customers.id))
    .where(eq(salesOrders.id, orderId))
    .limit(1);
  const linesQuery = db
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
    })
    .from(salesOrderLines)
    .innerJoin(products, eq(salesOrderLines.productId, products.id))
    .where(eq(salesOrderLines.salesOrderId, orderId))
    .orderBy(asc(salesOrderLines.createdAt), asc(salesOrderLines.id));

  const [headers, lines] = await db.batch([headerQuery, linesQuery]);
  const header = headers[0];

  return header ? { ...header, lines } : null;
}

export async function getPurchaseOrderDetails(orderId: string) {
  const headerQuery = db
    .select({
      id: purchaseOrders.id,
      orderNumber: purchaseOrders.orderNumber,
      status: purchaseOrders.status,
      vendor: {
        id: vendors.id,
        code: vendors.vendorCode,
        name: vendors.name,
      },
      orderDate: purchaseOrders.orderDate,
      expectedReceiptDate: purchaseOrders.expectedReceiptDate,
      currencyCode: purchaseOrders.currencyCode,
      subtotal: purchaseOrders.subtotal,
      taxTotal: purchaseOrders.taxTotal,
      grandTotal: purchaseOrders.grandTotal,
      procurementRequestId: purchaseOrders.procurementRequestId,
      notes: purchaseOrders.notes,
      confirmedAt: purchaseOrders.confirmedAt,
      cancelledAt: purchaseOrders.cancelledAt,
      createdAt: purchaseOrders.createdAt,
      updatedAt: purchaseOrders.updatedAt,
    })
    .from(purchaseOrders)
    .innerJoin(vendors, eq(purchaseOrders.vendorId, vendors.id))
    .where(eq(purchaseOrders.id, orderId))
    .limit(1);
  const linesQuery = db
    .select({
      id: purchaseOrderLines.id,
      productId: purchaseOrderLines.productId,
      sku: products.sku,
      productName: products.name,
      description: purchaseOrderLines.description,
      orderedQuantity: purchaseOrderLines.orderedQuantity,
      receivedQuantity: purchaseOrderLines.receivedQuantity,
      unitCost: purchaseOrderLines.unitCost,
      taxAmount: purchaseOrderLines.taxAmount,
      lineTotal: purchaseOrderLines.lineTotal,
    })
    .from(purchaseOrderLines)
    .innerJoin(products, eq(purchaseOrderLines.productId, products.id))
    .where(eq(purchaseOrderLines.purchaseOrderId, orderId))
    .orderBy(asc(purchaseOrderLines.createdAt), asc(purchaseOrderLines.id));

  const [headers, lines] = await db.batch([headerQuery, linesQuery]);
  const header = headers[0];

  return header ? { ...header, lines } : null;
}

export async function getManufacturingOrderDetails(orderId: string) {
  const componentProducts = alias(products, "component_products");
  const headerQuery = db
    .select({
      id: manufacturingOrders.id,
      orderNumber: manufacturingOrders.orderNumber,
      status: manufacturingOrders.status,
      product: {
        id: products.id,
        sku: products.sku,
        name: products.name,
      },
      bom: {
        id: boms.id,
        number: boms.bomNumber,
        version: boms.version,
      },
      plannedQuantity: manufacturingOrders.plannedQuantity,
      producedQuantity: manufacturingOrders.producedQuantity,
      warehouseId: manufacturingOrders.warehouseId,
      plannedStartAt: manufacturingOrders.plannedStartAt,
      plannedEndAt: manufacturingOrders.plannedEndAt,
      actualStartAt: manufacturingOrders.actualStartAt,
      actualEndAt: manufacturingOrders.actualEndAt,
      assigneeId: manufacturingOrders.assigneeId,
      procurementRequestId: manufacturingOrders.procurementRequestId,
      notes: manufacturingOrders.notes,
      createdAt: manufacturingOrders.createdAt,
      updatedAt: manufacturingOrders.updatedAt,
    })
    .from(manufacturingOrders)
    .innerJoin(products, eq(manufacturingOrders.productId, products.id))
    .innerJoin(boms, eq(manufacturingOrders.bomId, boms.id))
    .where(eq(manufacturingOrders.id, orderId))
    .limit(1);
  const componentsQuery = db
    .select({
      id: manufacturingComponents.id,
      productId: manufacturingComponents.productId,
      sku: componentProducts.sku,
      productName: componentProducts.name,
      requiredQuantity: manufacturingComponents.requiredQuantity,
      reservedQuantity: manufacturingComponents.reservedQuantity,
      consumedQuantity: manufacturingComponents.consumedQuantity,
      uomId: manufacturingComponents.uomId,
      sourceBomComponentId: manufacturingComponents.sourceBomComponentId,
    })
    .from(manufacturingComponents)
    .innerJoin(
      componentProducts,
      eq(manufacturingComponents.productId, componentProducts.id),
    )
    .where(eq(manufacturingComponents.manufacturingOrderId, orderId))
    .orderBy(asc(manufacturingComponents.createdAt), asc(manufacturingComponents.id));
  const workOrdersQuery = db
    .select({
      id: workOrders.id,
      workOrderNumber: workOrders.workOrderNumber,
      name: workOrders.name,
      sequence: workOrders.sequence,
      status: workOrders.status,
      workCenter: {
        id: workCenters.id,
        code: workCenters.code,
        name: workCenters.name,
      },
      plannedDurationMinutes: workOrders.plannedDurationMinutes,
      actualDurationMinutes: workOrders.actualDurationMinutes,
      assigneeId: workOrders.assigneeId,
      startedAt: workOrders.startedAt,
      completedAt: workOrders.completedAt,
    })
    .from(workOrders)
    .innerJoin(workCenters, eq(workOrders.workCenterId, workCenters.id))
    .where(eq(workOrders.manufacturingOrderId, orderId))
    .orderBy(asc(workOrders.sequence), asc(workOrders.id));

  const [headers, components, operations] = await db.batch([
    headerQuery,
    componentsQuery,
    workOrdersQuery,
  ]);
  const header = headers[0];

  return header ? { ...header, components, workOrders: operations } : null;
}

export interface MovementCursor {
  occurredAt: Date;
  id: string;
}

export async function listStockMovements(
  productId: string,
  options: { cursor?: MovementCursor; limit?: number } = {},
) {
  const limit = pageSize(options.limit);
  const fromLocations = alias(stockLocations, "from_locations");
  const toLocations = alias(stockLocations, "to_locations");
  const cursorFilter = options.cursor
    ? or(
        lt(stockMovements.occurredAt, options.cursor.occurredAt),
        and(
          eq(stockMovements.occurredAt, options.cursor.occurredAt),
          lt(stockMovements.id, options.cursor.id),
        ),
      )
    : undefined;

  const rows = await db
    .select({
      id: stockMovements.id,
      movementNumber: stockMovements.movementNumber,
      movementType: stockMovements.movementType,
      quantity: stockMovements.quantity,
      unitCost: stockMovements.unitCost,
      fromLocation: {
        id: fromLocations.id,
        code: fromLocations.code,
        name: fromLocations.name,
      },
      toLocation: {
        id: toLocations.id,
        code: toLocations.code,
        name: toLocations.name,
      },
      referenceType: stockMovements.referenceType,
      referenceId: stockMovements.referenceId,
      referenceLineId: stockMovements.referenceLineId,
      performedBy: stockMovements.performedBy,
      occurredAt: stockMovements.occurredAt,
    })
    .from(stockMovements)
    .leftJoin(
      fromLocations,
      eq(stockMovements.fromLocationId, fromLocations.id),
    )
    .leftJoin(toLocations, eq(stockMovements.toLocationId, toLocations.id))
    .where(and(eq(stockMovements.productId, productId), cursorFilter))
    .orderBy(desc(stockMovements.occurredAt), desc(stockMovements.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);

  return {
    items,
    nextCursor:
      hasMore && last ? { occurredAt: last.occurredAt, id: last.id } : null,
  };
}
