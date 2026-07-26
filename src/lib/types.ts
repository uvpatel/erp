export type UserRole = 
  | 'admin' 
  | 'sales' 
  | 'purchase' 
  | 'manufacturing' 
  | 'inventory' 
  | 'owner';

export type ProcurementStrategy = 'MTS' | 'MTO';
export type ProcurementType = 'Manufacturing' | 'Purchase';
export type ProductCategory = 'Finished Good' | 'Component' | 'Raw Material';

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  salesPrice: number;
  costPrice: number;
  onHandQty: number;
  reservedQty: number;
  procurementStrategy: ProcurementStrategy;
  procurementType: ProcurementType;
  procureOnDemand: boolean;
  vendorId?: string;
  bomId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoMComponent {
  id: string;
  bomId: string;
  componentProductId: string;
  quantity: number;
  componentName?: string;
}

export interface BoMOperation {
  id: string;
  bomId: string;
  name: string;
  workCenter: string;
  durationMinutes: number;
  stepOrder: number;
}

export interface BoM {
  id: string;
  name: string;
  productId: string;
  outputQty: number;
  description?: string;
  components: BoMComponent[];
  operations: BoMOperation[];
}

export type SalesOrderStatus = 'draft' | 'confirmed' | 'partially_delivered' | 'delivered' | 'cancelled';

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  productId: string;
  productName?: string;
  orderedQty: number;
  deliveredQty: number;
  unitPrice: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  status: SalesOrderStatus;
  totalAmount: number;
  items: SalesOrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export type PurchaseOrderStatus = 'draft' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  productName?: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendorName: string;
  vendorId?: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  triggeredFromSoId?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed';

export interface WorkOrder {
  id: string;
  manufacturingOrderId: string;
  name: string;
  workCenter: string;
  durationMinutes: number;
  status: WorkOrderStatus;
  completedAt?: string;
}

export type ManufacturingOrderStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productName?: string;
  bomId: string;
  targetQty: number;
  producedQty: number;
  status: ManufacturingOrderStatus;
  assignee?: string;
  triggeredFromSoId?: string;
  workOrders: WorkOrder[];
  createdAt: string;
  updatedAt?: string;
}

export type StockLedgerRefType = 'SO' | 'PO' | 'MO_CONSUMPTION' | 'MO_PRODUCTION' | 'ADJUSTMENT';

export interface StockLedgerEntry {
  id: string;
  productId: string;
  productName?: string;
  referenceType: StockLedgerRefType;
  referenceId: string;
  changeQty: number;
  resultingOnHand: number;
  resultingReserved: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export type AuditEntityType = 'Product' | 'SalesOrder' | 'PurchaseOrder' | 'ManufacturingOrder' | 'Inventory' | 'BoM';

export interface AuditLogEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  details: string;
  userName: string;
  createdAt: string;
}

export interface ErpState {
  products: Product[];
  vendors: Vendor[];
  boms: BoM[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  manufacturingOrders: ManufacturingOrder[];
  stockLedger: StockLedgerEntry[];
  auditLogs: AuditLogEntry[];
}
