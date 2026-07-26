'use client';

import React from 'react';
import { ErpState, UserRole } from '@/lib/types';
import { getFreeToUseQty } from '@/lib/erp-engine';
import {
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
  Factory,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Layers,
  Sparkles,
  Zap,
  Users,
  Building2,
} from 'lucide-react';

interface DashboardViewProps {
  state: ErpState;
  role: UserRole;
  onNavigate: (tab: string) => void;
  onResetData: () => void;
}

export function DashboardView({ state, role, onNavigate, onResetData }: DashboardViewProps) {
  // Compute Key Metrics
  const totalSalesRevenue = state.salesOrders
    .filter((so) => so.status !== 'cancelled')
    .reduce((acc, so) => acc + Number(so.totalAmount), 0);

  const totalSalesOrders = state.salesOrders.length;
  const pendingDeliveries = state.salesOrders.filter(
    (so) => so.status === 'confirmed' || so.status === 'partially_delivered'
  ).length;

  const activeMOs = state.manufacturingOrders.filter(
    (mo) => mo.status === 'confirmed' || mo.status === 'in_progress'
  ).length;

  const pendingPOs = state.purchaseOrders.filter(
    (po) => po.status === 'draft' || po.status === 'confirmed'
  ).length;

  const lowStockProducts = state.products.filter(
    (p) => getFreeToUseQty(p) <= 5
  );

  const mtoShortages = state.products.filter(
    (p) => p.procurementStrategy === 'MTO' && getFreeToUseQty(p) === 0
  );

  const completedMOs = state.manufacturingOrders.filter((mo) => mo.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-500/20">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Shiv Furniture Works • Centralized ERP Operations</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              From Demand to Delivery
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Real-time synchronization across Product Catalog, Sales Orders, BoMs, Procurement Automation (MTS / MTO), and Manufacturing Execution.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate('sales')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-md flex items-center gap-1.5"
            >
              <ShoppingCart className="h-4 w-4" />
              New Sales Order
            </button>
            <button
              onClick={() => onNavigate('manufacturing')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow-md flex items-center gap-1.5"
            >
              <Factory className="h-4 w-4" />
              Manufacturing Board
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="rounded-xl bg-card border p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sales Revenue
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">${totalSalesRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{totalSalesOrders} Orders Processed</span>
            </div>
          </div>
        </div>

        {/* Pending Deliveries */}
        <div className="rounded-xl bg-card border p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Deliveries
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{pendingDeliveries}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">
              Confirmed & ready for dispatch
            </div>
          </div>
        </div>

        {/* Active Manufacturing */}
        <div className="rounded-xl bg-card border p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Production MOs
            </span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
              <Factory className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{activeMOs} Active</div>
            <div className="text-xs text-indigo-600 font-medium mt-1">
              {completedMOs} Completed Batch(es)
            </div>
          </div>
        </div>

        {/* Low Stock & Shortages */}
        <div className="rounded-xl bg-card border p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Stock & Replenishment
            </span>
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600">{lowStockProducts.length} Items Low</div>
            <div className="text-xs text-rose-500 font-medium mt-1">
              {pendingPOs} Active Purchase Orders
            </div>
          </div>
        </div>
      </div>

      {/* Procurement & Traceability Flow Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core ERP Concept Box */}
        <div className="lg:col-span-2 rounded-xl bg-card border p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Inventory Movement Impact Matrix</h3>
              <p className="text-xs text-muted-foreground">Automatic stock adjustments on every business event</p>
            </div>
            <button
              onClick={() => onNavigate('ledger')}
              className="text-xs text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1"
            >
              View Stock Ledger <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
              <div className="text-xs font-bold text-rose-600 uppercase">Sales</div>
              <div className="text-base font-semibold mt-1">Decreases Stock</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Reserves on SO, deducts on delivery</div>
            </div>
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div className="text-xs font-bold text-emerald-600 uppercase">Purchase</div>
              <div className="text-base font-semibold mt-1">Increases Stock</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Replenishes on vendor receipt</div>
            </div>
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <div className="text-xs font-bold text-amber-600 uppercase">MO Components</div>
              <div className="text-base font-semibold mt-1">Consumes Stock</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Deducts raw materials via BoM</div>
            </div>
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
              <div className="text-xs font-bold text-indigo-600 uppercase">MO Finished</div>
              <div className="text-base font-semibold mt-1">Produces Stock</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Outputs finished goods</div>
            </div>
          </div>

          {/* Quick Product Stock Overview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Stock Balances (Free To Use = On Hand - Reserved)
              </h4>
              <button
                onClick={() => onNavigate('products')}
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                Manage All Products ({state.products.length})
              </button>
            </div>
            <div className="divide-y rounded-lg border overflow-hidden">
              {state.products.map((p) => {
                const freeQty = getFreeToUseQty(p);
                return (
                  <div key={p.id} className="p-3 flex items-center justify-between text-sm bg-card hover:bg-muted/50 transition">
                    <div>
                      <div className="font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        SKU: {p.sku} • Strategy: <span className="font-semibold text-foreground">{p.procurementStrategy}</span> ({p.procurementType})
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">On Hand: <span className="font-semibold text-foreground">{p.onHandQty}</span></div>
                        <div className="text-xs text-muted-foreground">Reserved: <span className="font-semibold text-amber-600">{p.reservedQty}</span></div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        freeQty > 10 ? 'bg-emerald-500/10 text-emerald-600' : freeQty > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        Free: {freeQty}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Audit Log Stream & Quick Stats */}
        <div className="rounded-xl bg-card border p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Live Audit Stream</h3>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {state.auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 rounded-lg border bg-muted/30 text-xs space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-indigo-600 font-semibold">[{log.entityType}] {log.action}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 border rounded bg-muted/20">
                <span className="text-muted-foreground">Registered BoMs</span>
                <div className="text-base font-bold text-foreground">{state.boms.length} BoMs</div>
              </div>
              <div className="p-2 border rounded bg-muted/20">
                <span className="text-muted-foreground">Active Vendors</span>
                <div className="text-base font-bold text-foreground">{state.vendors.length} Vendors</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">Reset Shiv Furniture dataset</span>
              <button
                onClick={onResetData}
                className="px-3 py-1.5 border border-muted-foreground/30 hover:bg-muted text-xs rounded-md font-medium transition"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
