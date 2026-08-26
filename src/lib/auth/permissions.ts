// src/lib/auth/permissions.ts

import { createAccessControl } from "better-auth/plugins/access";

// permission statement for the application
export const statement = {
  product: [
    "read",
    "create",
    "update",
    "delete",
  ],

  sales: [
    "read",
    "create",
    "update",
    "delete",
    "confirm",
    "deliver",
    "cancel",
  ],

  purchase: [
    "read",
    "create",
    "update",
    "delete",
    "confirm",
    "receive",
    "cancel",
  ],

  manufacturing: [
    "read",
    "create",
    "update",
    "delete",
    "confirm",
    "start",
    "complete",
    "cancel",
  ],

  inventory: [
    "read",
    "adjust",
    "reserve",
    "release",
    "transfer",
  ],

  bom: [
    "read",
    "create",
    "update",
    "delete",
  ],

  procurement: [
    "read",
    "create",
    "manage",
  ],

  dashboard: [
    "read",
  ],

  audit: [
    "read",
  ],

  user: [
    "read",
    "create",
    "update",
    "delete",
    "assign-role",
  ],
} as const;

export const ac = createAccessControl(statement);


// admin role with all permissions
export const adminRole = ac.newRole({
  product: ["read", "create", "update", "delete"],

  sales: [
    "read",
    "create",
    "update",
    "delete",
    "confirm",
    "deliver",
    "cancel",
  ],

  purchase: [
    "read",
    "create",
    "update",
    "delete",
    "confirm",
    "receive",
    "cancel",
  ],

  manufacturing: [
    "read",
    "create",
    "update",
    "delete",
    "confirm",
    "start",
    "complete",
    "cancel",
  ],

  inventory: [
    "read",
    "adjust",
    "reserve",
    "release",
    "transfer",
  ],

  bom: ["read", "create", "update", "delete"],
  procurement: ["read", "create", "manage"],
  dashboard: ["read"],
  audit: ["read"],
  user: ["read", "create", "update", "delete", "assign-role"],
});

// sales role
export const salesRole = ac.newRole({
  product: ["read"],
  sales: [
    "read",
    "create",
    "update",
    "confirm",
    "deliver",
    "cancel",
  ],
  inventory: ["read"],
  dashboard: ["read"],
});

// purchase role

export const purchaseRole = ac.newRole({
  product: ["read"],
  purchase: [
    "read",
    "create",
    "update",
    "confirm",
    "receive",
    "cancel",
  ],
  inventory: ["read"],
  procurement: ["read"],
  dashboard: ["read"],
});


// manufacturing role
export const manufacturingRole = ac.newRole({
  product: ["read"],

  manufacturing: [
    "read",
    "create",
    "update",
    "confirm",
    "start",
    "complete",
    "cancel",
  ],

  inventory: ["read", "reserve", "release"],

  bom: ["read"],

  procurement: ["read"],

  dashboard: ["read"],
});


// inventory role
export const inventoryRole = ac.newRole({
  product: ["read"],

  inventory: [
    "read",
    "adjust",
    "reserve",
    "release",
    "transfer",
  ],

  dashboard: ["read"],
});


// owner role
export const ownerRole = ac.newRole({
  product: ["read", "create", "update", "delete"],
  sales: ["read"],
  purchase: ["read"],
  manufacturing: ["read"],
  inventory: ["read"],
  bom: ["read"],
  procurement: ["read"],
  dashboard: ["read"],
  audit: ["read"],
});


// export 
export const roles = {
  admin: adminRole,
  sales: salesRole,
  purchase: purchaseRole,
  manufacturing: manufacturingRole,
  inventory: inventoryRole,
  owner: ownerRole,
};