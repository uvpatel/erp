'use client';

import React from 'react';
import Link from 'next/link';
import { useErpData, useResetErpMutation } from '@/hooks/use-erp-query';
import { useErpStore } from '@/store/useErpStore';
import { getFreeToUseQty } from '@/lib/erp-engine';
import {
  DollarSign,
  Truck,
  Factory,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export default function ExecutiveDashboardPage() {
  const { data: state, isLoading, isError } = useErpData();
  const resetMutation = useResetErpMutation();
  const currentRole = useErpStore((s) => s.currentRole);

  if (isLoading || !state) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-lg bg-rose-500/10 text-rose-600 font-semibold text-sm">
        Failed to load ERP state from server.
      </div>
    );
  }

  // Key Metrics
  const totalSalesRevenue = state.salesOrders
    .filter((so) => so.status !== 'cancelled')
    .reduce((acc, so) => acc + Number(so.totalAmount), 0);

  const pendingDeliveries = state.salesOrders.filter(
    (so) => so.status === 'confirmed' || so.status === 'partially_delivered'
  ).length;

  const activeMOs = state.manufacturingOrders.filter(
    (mo) => mo.status === 'confirmed' || mo.status === 'in_progress'
  ).length;

  const lowStockProducts = state.products.filter(
    (p) => getFreeToUseQty(p) <= 5
  );

  // Prepare Recharts Data
  const stockChartData = state.products.map((p) => ({
    name: p.sku,
    product: p.name,
    onHand: p.onHandQty,
    reserved: p.reservedQty,
    freeToUse: getFreeToUseQty(p),
  }));

  const revenueData = [
    { month: 'May', sales: 4200, purchases: 1800, production: 3200 },
    { month: 'Jun', sales: 5800, purchases: 2400, production: 4100 },
    { month: 'Jul', sales: totalSalesRevenue || 8400, purchases: 3100, production: 5200 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Shiv Furniture Works • Executive Dashboard (PostgreSQL & TanStack Query)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Mini ERP Overview
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Demand-to-Delivery orchestration with real-time stock availability, BoMs, and automated procurement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/sales"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <ShoppingCart className="h-4 w-4" />
              New Sales Order
            </Link>
            <Link
              href="/dashboard/manufacturing"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <Factory className="h-4 w-4" />
              Manufacturing Board
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-card border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Sales Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">${totalSalesRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{state.salesOrders.length} Sales Orders</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Pending Deliveries</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{pendingDeliveries}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">Ready for dispatch</div>
          </div>
        </div>

        <div className="rounded-xl bg-card border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Active Production</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
              <Factory className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{activeMOs} MOs</div>
            <div className="text-xs text-indigo-600 font-medium mt-1">Work Orders active</div>
          </div>
        </div>

        <div className="rounded-xl bg-card border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Low Stock Alerts</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600">{lowStockProducts.length} Items</div>
            <div className="text-xs text-rose-500 font-medium mt-1">Replenishment needed</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Operations Trend Chart */}
        <div className="rounded-xl bg-card border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">Revenue & Operational Volume</h3>
              <p className="text-xs text-muted-foreground">Monthly Sales ($) vs Procurement & Production</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415515" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#4f46e5" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="purchases" name="Purchases ($)" stroke="#10b981" fillOpacity={1} fill="url(#colorPurchases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Balances Bar Chart */}
        <div className="rounded-xl bg-card border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">Current Stock Breakdown</h3>
              <p className="text-xs text-muted-foreground">On Hand vs Reserved Stock per SKU</p>
            </div>
            <Link href="/dashboard/products" className="text-xs font-semibold text-indigo-600 hover:underline">
              View Catalog
            </Link>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415515" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="onHand" name="On Hand Qty" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reserved" name="Reserved Qty" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Stream Preview & Reset */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-card border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">Inventory Movement Matrix</h3>
              <p className="text-xs text-muted-foreground">Automated stock adjustments triggered by each module</p>
            </div>
            <Link href="/dashboard/stock-ledger" className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
              Stock Ledger <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
              <div className="text-xs font-bold text-rose-600 uppercase">Sales</div>
              <div className="text-sm font-semibold mt-1">Decreases Stock</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Reserves on SO, deducts on delivery</div>
            </div>
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div className="text-xs font-bold text-emerald-600 uppercase">Purchase</div>
              <div className="text-sm font-semibold mt-1">Increases Stock</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Replenishes on vendor receipt</div>
            </div>
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <div className="text-xs font-bold text-amber-600 uppercase">MO Components</div>
              <div className="text-sm font-semibold mt-1">Consumes Stock</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Deducts raw materials via BoM</div>
            </div>
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
              <div className="text-xs font-bold text-indigo-600 uppercase">MO Finished</div>
              <div className="text-sm font-semibold mt-1">Produces Stock</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Outputs finished goods</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card border p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Live Audit Stream</h3>
              <Link href="/dashboard/audit-logs" className="text-xs text-indigo-600 font-medium hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {state.auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg border bg-muted/30 text-xs space-y-1">
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

          <div className="pt-4 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Reset Shiv Furniture state</span>
            <button
              onClick={() => resetMutation.mutate()}
              className="px-3 py-1.5 border border-muted-foreground/30 hover:bg-muted text-xs rounded-md font-medium transition"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
