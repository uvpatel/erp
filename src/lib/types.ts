export type UserRole =
  | 'admin'
  | 'sales'
  | 'purchase'
  | 'manufacturing'
  | 'inventory'
  | 'owner';

export interface UserRoleDefinition {
  role: UserRole;
  label: string;
  description: string;
  responsibilities: string[];
}

export const USER_ROLES: Record<UserRole, UserRoleDefinition> = {
  admin: {
    role: 'admin',
    label: 'Admin',
    description: 'Full system access',
    responsibilities: [
      'Full administrative control over all modules',
      'Manage users, roles, and security permissions',
      'Configure system settings and audit log tracking',
      'Override, approve, and manage all business workflows',
    ],
  },
  sales: {
    role: 'sales',
    label: 'Sales User',
    description: 'Manage sales orders',
    responsibilities: [
      'Create and update sales quotations and orders',
      'Confirm customer orders and initiate deliveries',
      'Manage customer profiles and review inventory availability',
    ],
  },
  purchase: {
    role: 'purchase',
    label: 'Purchase User',
    description: 'Manage purchase orders',
    responsibilities: [
      'Create and manage purchase orders to suppliers',
      'Receive incoming goods and validate vendor receipts',
      'Review procurement demand and supplier catalogs',
    ],
  },
  manufacturing: {
    role: 'manufacturing',
    label: 'Manufacturing User',
    description: 'Handle manufacturing orders',
    responsibilities: [
      'Manage and execute manufacturing orders (MO)',
      'Start and complete work orders on work centers',
      'Consume raw materials, BOM items, and produce finished goods',
      'Reserve and release production inventory',
    ],
  },
  inventory: {
    role: 'inventory',
    label: 'Inventory Manager',
    description: 'Track stock movement',
    responsibilities: [
      'Track real-time stock balances across warehouses and locations',
      'Execute internal stock transfers, adjustments, and cycle counts',
      'Manage reservations and physical inventory intake/dispatch',
    ],
  },
  owner: {
    role: 'owner',
    label: 'Business Owner',
    description: 'Monitor business flow (manages product)',
    responsibilities: [
      'Executive dashboard and high-level KPIs across all business flows',
      'Product lifecycle management (create, update, price, and catalog products)',
      'Read-only oversight across Sales, Purchase, Manufacturing, and Inventory',
    ],
  },
};

export interface Product {
  id: string;
  name: string;
  sku: string;
  type: string;
  price: number;
  cost: number;
  uom?: string;
  stockQty?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  status: 'draft' | 'confirmed' | 'delivered' | 'cancelled';
  totalAmount: number;
  items?: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendorId?: string;
  vendorName?: string;
  status: 'draft' | 'confirmed' | 'received' | 'cancelled';
  totalAmount: number;
  items?: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productName?: string;
  targetQty: number;
  producedQty?: number;
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  assignee?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ErpState {
  products: Product[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  manufacturingOrders: ManufacturingOrder[];
  stockBalances?: any[];
  auditLogs?: any[];
}
