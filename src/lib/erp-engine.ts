import {
  ErpState,
  Product,
  SalesOrder,
  PurchaseOrder,
  ManufacturingOrder,
  StockLedgerEntry,
  AuditLogEntry,
  BoM,
  Vendor,
} from './types';
import { initialErpState } from './seed-data';

const STORAGE_KEY = 'mini_erp_state_v1';

export function loadErpState(): ErpState {
  if (typeof window === 'undefined') return initialErpState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialErpState;
    const parsed = JSON.parse(raw);
    return {
      products: parsed.products || initialErpState.products,
      vendors: parsed.vendors || initialErpState.vendors,
      boms: parsed.boms || initialErpState.boms,
      salesOrders: parsed.salesOrders || initialErpState.salesOrders,
      purchaseOrders: parsed.purchaseOrders || initialErpState.purchaseOrders,
      manufacturingOrders: parsed.manufacturingOrders || initialErpState.manufacturingOrders,
      stockLedger: parsed.stockLedger || initialErpState.stockLedger,
      auditLogs: parsed.auditLogs || initialErpState.auditLogs,
    };
  } catch (e) {
    console.error('Failed to load ERP state from storage:', e);
    return initialErpState;
  }
}

export function saveErpState(state: ErpState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save ERP state:', e);
  }
}

export function resetErpState(): ErpState {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return initialErpState;
}

export function getFreeToUseQty(product: Product): number {
  return Math.max(0, product.onHandQty - product.reservedQty);
}

// -------------------------------------------------------------
// CORE BUSINESS FLOW 1: CONFIRM SALES ORDER (WITH AUTO PROCUREMENT)
// -------------------------------------------------------------
export function confirmSalesOrder(
  state: ErpState,
  soId: string,
  userName = 'Sales Manager'
): { state: ErpState; triggeredMOs: string[]; triggeredPOs: string[] } {
  const soIndex = state.salesOrders.findIndex((s) => s.id === soId);
  if (soIndex === -1) return { state, triggeredMOs: [], triggeredPOs: [] };

  const so = state.salesOrders[soIndex];
  if (so.status !== 'draft') return { state, triggeredMOs: [], triggeredPOs: [] };

  const newProducts = [...state.products];
  const newMOs = [...state.manufacturingOrders];
  const newPOs = [...state.purchaseOrders];
  const newAuditLogs = [...state.auditLogs];
  const triggeredMOs: string[] = [];
  const triggeredPOs: string[] = [];

  const now = new Date().toISOString();

  so.items.forEach((item) => {
    const pIndex = newProducts.findIndex((p) => p.id === item.productId);
    if (pIndex === -1) return;

    const prod = { ...newProducts[pIndex] };
    const freeQty = getFreeToUseQty(prod);
    const neededQty = item.orderedQty;

    // Reserve available stock up to needed amount
    const allocatable = Math.min(freeQty, neededQty);
    if (allocatable > 0) {
      prod.reservedQty += allocatable;
    }

    const shortage = neededQty - allocatable;

    // Check if Auto-Procurement is required (MTO or procureOnDemand)
    if (shortage > 0 && (prod.procurementStrategy === 'MTO' || prod.procureOnDemand)) {
      if (prod.procurementType === 'Manufacturing') {
        // Find BoM
        const bom = state.boms.find((b) => b.productId === prod.id) || state.boms[0];
        const moNum = `MO-AUTO-${Date.now().toString().slice(-4)}`;
        const moId = `mo-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

        const newMo: ManufacturingOrder = {
          id: moId,
          orderNumber: moNum,
          productId: prod.id,
          productName: prod.name,
          bomId: bom ? bom.id : 'bom-table',
          targetQty: shortage,
          producedQty: 0,
          status: 'confirmed',
          assignee: 'Auto-Procurement System',
          triggeredFromSoId: so.id,
          workOrders: (bom ? bom.operations : []).map((op, idx) => ({
            id: `wo-${moId}-${idx}`,
            manufacturingOrderId: moId,
            name: op.name,
            workCenter: op.workCenter,
            durationMinutes: op.durationMinutes,
            status: idx === 0 ? 'in_progress' : 'pending',
          })),
          createdAt: now,
        };

        newMOs.unshift(newMo);
        triggeredMOs.push(moNum);

        // Audit Log for MO Auto-Trigger
        newAuditLogs.unshift({
          id: `al-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          entityType: 'ManufacturingOrder',
          entityId: moId,
          action: 'PROCUREMENT_TRIGGER',
          details: `AUTO-TRIGGERED Manufacturing Order ${moNum} for ${shortage} units of ${prod.name} (Shortage on ${so.orderNumber}).`,
          userName: 'Procurement Automation Engine',
          createdAt: now,
        });
      } else if (prod.procurementType === 'Purchase') {
        // Auto create PO
        const vendor = state.vendors.find((v) => v.id === prod.vendorId) || state.vendors[0];
        const poNum = `PO-AUTO-${Date.now().toString().slice(-4)}`;
        const poId = `po-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

        const newPo: PurchaseOrder = {
          id: poId,
          orderNumber: poNum,
          vendorName: vendor ? vendor.name : 'Primary Vendor',
          vendorId: vendor ? vendor.id : undefined,
          status: 'confirmed',
          totalAmount: shortage * prod.costPrice,
          triggeredFromSoId: so.id,
          items: [
            {
              id: `poi-${poId}-1`,
              purchaseOrderId: poId,
              productId: prod.id,
              productName: prod.name,
              orderedQty: shortage,
              receivedQty: 0,
              unitCost: prod.costPrice,
            },
          ],
          createdAt: now,
        };

        newPOs.unshift(newPo);
        triggeredPOs.push(poNum);

        // Audit Log for PO Auto-Trigger
        newAuditLogs.unshift({
          id: `al-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          entityType: 'PurchaseOrder',
          entityId: poId,
          action: 'PROCUREMENT_TRIGGER',
          details: `AUTO-TRIGGERED Purchase Order ${poNum} to ${vendor?.name || 'Vendor'} for ${shortage} units of ${prod.name} (Shortage on ${so.orderNumber}).`,
          userName: 'Procurement Automation Engine',
          createdAt: now,
        });
      }
    }

    newProducts[pIndex] = prod;
  });

  const updatedSalesOrders = [...state.salesOrders];
  updatedSalesOrders[soIndex] = {
    ...so,
    status: 'confirmed',
    updatedAt: now,
  };

  newAuditLogs.unshift({
    id: `al-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    entityType: 'SalesOrder',
    entityId: so.id,
    action: 'STATUS_CHANGE',
    details: `Sales Order ${so.orderNumber} confirmed. ${triggeredMOs.length > 0 ? `Auto MOs: ${triggeredMOs.join(', ')}. ` : ''}${triggeredPOs.length > 0 ? `Auto POs: ${triggeredPOs.join(', ')}.` : ''}`,
    userName,
    createdAt: now,
  });

  const newState: ErpState = {
    ...state,
    products: newProducts,
    salesOrders: updatedSalesOrders,
    manufacturingOrders: newMOs,
    purchaseOrders: newPOs,
    auditLogs: newAuditLogs,
  };

  saveErpState(newState);
  return { state: newState, triggeredMOs, triggeredPOs };
}

// -------------------------------------------------------------
// CORE BUSINESS FLOW 2: DELIVER SALES ORDER
// -------------------------------------------------------------
export function deliverSalesOrder(
  state: ErpState,
  soId: string,
  userName = 'Inventory Manager'
): ErpState {
  const soIndex = state.salesOrders.findIndex((s) => s.id === soId);
  if (soIndex === -1) return state;

  const so = state.salesOrders[soIndex];
  if (so.status !== 'confirmed') return state;

  const newProducts = [...state.products];
  const newLedger = [...state.stockLedger];
  const newAudit = [...state.auditLogs];
  const now = new Date().toISOString();

  so.items.forEach((item) => {
    const pIndex = newProducts.findIndex((p) => p.id === item.productId);
    if (pIndex === -1) return;

    const prod = { ...newProducts[pIndex] };
    const qty = item.orderedQty;

    // Deduct stock
    prod.onHandQty = Math.max(0, prod.onHandQty - qty);
    prod.reservedQty = Math.max(0, prod.reservedQty - qty);
    newProducts[pIndex] = prod;

    // Stock Ledger entry
    newLedger.unshift({
      id: `sl-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: prod.id,
      productName: prod.name,
      referenceType: 'SO',
      referenceId: so.orderNumber,
      changeQty: -qty,
      resultingOnHand: prod.onHandQty,
      resultingReserved: prod.reservedQty,
      notes: `Delivered ${qty} units for Sales Order ${so.orderNumber}`,
      createdAt: now,
      createdBy: userName,
    });
  });

  const updatedSalesOrders = [...state.salesOrders];
  updatedSalesOrders[soIndex] = {
    ...so,
    status: 'delivered',
    items: so.items.map((i) => ({ ...i, deliveredQty: i.orderedQty })),
    updatedAt: now,
  };

  newAudit.unshift({
    id: `al-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    entityType: 'SalesOrder',
    entityId: so.id,
    action: 'DELIVERY',
    details: `Sales Order ${so.orderNumber} delivered to ${so.customerName}. Stock decreased.`,
    userName,
    createdAt: now,
  });

  const newState: ErpState = {
    ...state,
    products: newProducts,
    salesOrders: updatedSalesOrders,
    stockLedger: newLedger,
    auditLogs: newAudit,
  };

  saveErpState(newState);
  return newState;
}

// -------------------------------------------------------------
// CORE BUSINESS FLOW 3: RECEIVE PURCHASE ORDER
// -------------------------------------------------------------
export function receivePurchaseOrder(
  state: ErpState,
  poId: string,
  userName = 'Purchase Manager'
): ErpState {
  const poIndex = state.purchaseOrders.findIndex((p) => p.id === poId);
  if (poIndex === -1) return state;

  const po = state.purchaseOrders[poIndex];
  if (po.status === 'received' || po.status === 'cancelled') return state;

  const newProducts = [...state.products];
  const newLedger = [...state.stockLedger];
  const newAudit = [...state.auditLogs];
  const now = new Date().toISOString();

  po.items.forEach((item) => {
    const pIndex = newProducts.findIndex((p) => p.id === item.productId);
    if (pIndex === -1) return;

    const prod = { ...newProducts[pIndex] };
    const qty = item.orderedQty;

    prod.onHandQty += qty;
    newProducts[pIndex] = prod;

    newLedger.unshift({
      id: `sl-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: prod.id,
      productName: prod.name,
      referenceType: 'PO',
      referenceId: po.orderNumber,
      changeQty: qty,
      resultingOnHand: prod.onHandQty,
      resultingReserved: prod.reservedQty,
      notes: `Received ${qty} units from Vendor ${po.vendorName} on PO ${po.orderNumber}`,
      createdAt: now,
      createdBy: userName,
    });
  });

  const updatedPOs = [...state.purchaseOrders];
  updatedPOs[poIndex] = {
    ...po,
    status: 'received',
    items: po.items.map((i) => ({ ...i, receivedQty: i.orderedQty })),
    updatedAt: now,
  };

  newAudit.unshift({
    id: `al-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    entityType: 'PurchaseOrder',
    entityId: po.id,
    action: 'RECEIPT',
    details: `Purchase Order ${po.orderNumber} received. Stock replenished for ${po.items.map((i) => `${i.orderedQty}x ${i.productName}`).join(', ')}.`,
    userName,
    createdAt: now,
  });

  const newState: ErpState = {
    ...state,
    products: newProducts,
    purchaseOrders: updatedPOs,
    stockLedger: newLedger,
    auditLogs: newAudit,
  };

  saveErpState(newState);
  return newState;
}

// -------------------------------------------------------------
// CORE BUSINESS FLOW 4: COMPLETE MANUFACTURING ORDER
// -------------------------------------------------------------
export function completeManufacturingOrder(
  state: ErpState,
  moId: string,
  userName = 'Manufacturing Lead'
): ErpState {
  const moIndex = state.manufacturingOrders.findIndex((m) => m.id === moId);
  if (moIndex === -1) return state;

  const mo = state.manufacturingOrders[moIndex];
  if (mo.status === 'completed' || mo.status === 'cancelled') return state;

  const newProducts = [...state.products];
  const newLedger = [...state.stockLedger];
  const newAudit = [...state.auditLogs];
  const now = new Date().toISOString();

  // Find BoM
  const bom = state.boms.find((b) => b.id === mo.bomId) || state.boms[0];

  // Consumes Components
  if (bom) {
    bom.components.forEach((comp) => {
      const cIndex = newProducts.findIndex((p) => p.id === comp.componentProductId);
      if (cIndex !== -1) {
        const componentProd = { ...newProducts[cIndex] };
        const totalConsumed = comp.quantity * mo.targetQty;

        componentProd.onHandQty = Math.max(0, componentProd.onHandQty - totalConsumed);
        newProducts[cIndex] = componentProd;

        newLedger.unshift({
          id: `sl-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          productId: componentProd.id,
          productName: componentProd.name,
          referenceType: 'MO_CONSUMPTION',
          referenceId: mo.orderNumber,
          changeQty: -totalConsumed,
          resultingOnHand: componentProd.onHandQty,
          resultingReserved: componentProd.reservedQty,
          notes: `Consumed ${totalConsumed} units for MO ${mo.orderNumber} (${mo.productName})`,
          createdAt: now,
          createdBy: userName,
        });
      }
    });
  }

  // Produce Finished Good
  const fIndex = newProducts.findIndex((p) => p.id === mo.productId);
  if (fIndex !== -1) {
    const finishedProd = { ...newProducts[fIndex] };
    finishedProd.onHandQty += mo.targetQty;
    newProducts[fIndex] = finishedProd;

    newLedger.unshift({
      id: `sl-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: finishedProd.id,
      productName: finishedProd.name,
      referenceType: 'MO_PRODUCTION',
      referenceId: mo.orderNumber,
      changeQty: mo.targetQty,
      resultingOnHand: finishedProd.onHandQty,
      resultingReserved: finishedProd.reservedQty,
      notes: `Produced ${mo.targetQty} units from MO ${mo.orderNumber}`,
      createdAt: now,
      createdBy: userName,
    });
  }

  const updatedMOs = [...state.manufacturingOrders];
  updatedMOs[moIndex] = {
    ...mo,
    status: 'completed',
    producedQty: mo.targetQty,
    workOrders: mo.workOrders.map((wo) => ({
      ...wo,
      status: 'completed',
      completedAt: now,
    })),
    updatedAt: now,
  };

  newAudit.unshift({
    id: `al-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    entityType: 'ManufacturingOrder',
    entityId: mo.id,
    action: 'PRODUCED',
    details: `Manufacturing Order ${mo.orderNumber} completed. ${mo.targetQty} units of ${mo.productName} added to Finished Goods inventory.`,
    userName,
    createdAt: now,
  });

  const newState: ErpState = {
    ...state,
    products: newProducts,
    manufacturingOrders: updatedMOs,
    stockLedger: newLedger,
    auditLogs: newAudit,
  };

  saveErpState(newState);
  return newState;
}

// -------------------------------------------------------------
// HELPER CREATORS & UPDATERS
// -------------------------------------------------------------
export function addProduct(state: ErpState, product: Omit<Product, 'id' | 'createdAt'>): ErpState {
  const newProduct: Product = {
    ...product,
    id: `p-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const newState: ErpState = {
    ...state,
    products: [newProduct, ...state.products],
    auditLogs: [
      {
        id: `al-${Date.now()}`,
        entityType: 'Product',
        entityId: newProduct.id,
        action: 'CREATE',
        details: `Created new product ${newProduct.name} (${newProduct.sku}) with ${newProduct.procurementStrategy} / ${newProduct.procurementType}.`,
        userName: 'Product Manager',
        createdAt: new Date().toISOString(),
      },
      ...state.auditLogs,
    ],
  };

  saveErpState(newState);
  return newState;
}

export function createSalesOrder(state: ErpState, soData: Omit<SalesOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>): ErpState {
  const orderNum = `SO-2026-${(state.salesOrders.length + 1).toString().padStart(3, '0')}`;
  const newSo: SalesOrder = {
    ...soData,
    id: `so-${Date.now()}`,
    orderNumber: orderNum,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };

  const newState: ErpState = {
    ...state,
    salesOrders: [newSo, ...state.salesOrders],
    auditLogs: [
      {
        id: `al-${Date.now()}`,
        entityType: 'SalesOrder',
        entityId: newSo.id,
        action: 'CREATE',
        details: `Drafted Sales Order ${newSo.orderNumber} for ${newSo.customerName} ($${newSo.totalAmount}).`,
        userName: 'Sales Rep',
        createdAt: new Date().toISOString(),
      },
      ...state.auditLogs,
    ],
  };

  saveErpState(newState);
  return newState;
}

export function createPurchaseOrder(state: ErpState, poData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>): ErpState {
  const orderNum = `PO-2026-${(state.purchaseOrders.length + 1).toString().padStart(3, '0')}`;
  const newPo: PurchaseOrder = {
    ...poData,
    id: `po-${Date.now()}`,
    orderNumber: orderNum,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };

  const newState: ErpState = {
    ...state,
    purchaseOrders: [newPo, ...state.purchaseOrders],
    auditLogs: [
      {
        id: `al-${Date.now()}`,
        entityType: 'PurchaseOrder',
        entityId: newPo.id,
        action: 'CREATE',
        details: `Drafted Purchase Order ${newPo.orderNumber} for vendor ${newPo.vendorName} ($${newPo.totalAmount}).`,
        userName: 'Purchase Manager',
        createdAt: new Date().toISOString(),
      },
      ...state.auditLogs,
    ],
  };

  saveErpState(newState);
  return newState;
}

export function createManufacturingOrder(state: ErpState, moData: { productId: string; targetQty: number; assignee?: string }): ErpState {
  const prod = state.products.find((p) => p.id === moData.productId);
  if (!prod) return state;

  const bom = state.boms.find((b) => b.productId === prod.id) || state.boms[0];
  const orderNum = `MO-2026-${(state.manufacturingOrders.length + 1).toString().padStart(3, '0')}`;
  const moId = `mo-${Date.now()}`;

  const newMo: ManufacturingOrder = {
    id: moId,
    orderNumber: orderNum,
    productId: prod.id,
    productName: prod.name,
    bomId: bom ? bom.id : 'bom-table',
    targetQty: moData.targetQty,
    producedQty: 0,
    status: 'confirmed',
    assignee: moData.assignee || 'Manufacturing Operator',
    workOrders: (bom ? bom.operations : []).map((op, idx) => ({
      id: `wo-${moId}-${idx}`,
      manufacturingOrderId: moId,
      name: op.name,
      workCenter: op.workCenter,
      durationMinutes: op.durationMinutes,
      status: idx === 0 ? 'in_progress' : 'pending',
    })),
    createdAt: new Date().toISOString(),
  };

  const newState: ErpState = {
    ...state,
    manufacturingOrders: [newMo, ...state.manufacturingOrders],
    auditLogs: [
      {
        id: `al-${Date.now()}`,
        entityType: 'ManufacturingOrder',
        entityId: newMo.id,
        action: 'CREATE',
        details: `Created Manufacturing Order ${newMo.orderNumber} for ${newMo.targetQty}x ${prod.name}.`,
        userName: 'Manufacturing Planner',
        createdAt: new Date().toISOString(),
      },
      ...state.auditLogs,
    ],
  };

  saveErpState(newState);
  return newState;
}
