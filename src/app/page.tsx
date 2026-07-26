'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Package,
  Layers,
  ShoppingCart,
  ShoppingBag,
  Factory,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Boxes,
  Truck,
  ChevronRight,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Grid Accent */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className={cn(
            "absolute inset-0 opacity-20",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)]"
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#020617)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-emerald-600/10 blur-[100px]" />
      </div>

      {/* Header Navigation */}
      <header className="relative z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
              S
            </div>
            <div>
              <div className="font-bold text-base tracking-tight flex items-center gap-2">
                Shiv Furniture ERP
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Odoo Hackathon
                </span>
              </div>
              <div className="text-xs text-slate-400">Demand to Delivery Digital Platform</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-indigo-400 transition">Core Modules</Link>
            <Link href="#workflow" className="hover:text-indigo-400 transition">Business Flow</Link>
            <Link href="#procurement" className="hover:text-indigo-400 transition">MTS vs MTO</Link>
            <Link href="#roles" className="hover:text-indigo-400 transition">User Access Rights</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <span>Launch ERP</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6 shadow-inner">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Mini ERP System • From Demand to Delivery</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 leading-[1.1]">
          Centralized Digital Backbone for Growing Manufacturing
        </h1>

        <p className="mt-6 text-slate-400 text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
          Solve stock confusion, manual paper BoMs, delayed deliveries, and procurement bottlenecks.
          Shiv Furniture Works digitally orchestrates <strong className="text-slate-200">Sales</strong>, <strong className="text-slate-200">Bill of Materials</strong>, <strong className="text-slate-200">Automated Replenishment (MTS/MTO)</strong>, and <strong className="text-slate-200">Manufacturing Execution</strong> in one unified platform.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <span>Open Executive Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard/sales"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <span>Test Live Sales & Auto-Procurement</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </Link>
        </div>

        {/* Live Interactive Business Flow Preview Card */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-4 md:p-6 shadow-2xl backdrop-blur-xl text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">Shiv Furniture Works • Core Business Flow Pipeline</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Real-Time Sync
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Step 1 — Demand</div>
              <div className="font-bold text-slate-200 text-sm">Sales Order Confirmed</div>
              <p className="text-slate-400">Customer requests 10 Wooden Tables ($250/unit).</p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Step 2 — Inventory</div>
              <div className="font-bold text-slate-200 text-sm">Stock Availability Check</div>
              <p className="text-slate-400">On-Hand: 2 Tables. Reserved: 2. <strong className="text-amber-400">Shortage: 8 Tables</strong>.</p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 3 — Auto Procurement</div>
              <div className="font-bold text-amber-300 text-sm">MTO Trigger Engine</div>
              <p className="text-slate-300">Auto-creates <strong>Manufacturing Order MO-AUTO-2026</strong> for 8 tables.</p>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Step 4 — Manufacturing</div>
              <div className="font-bold text-indigo-300 text-sm">BoM Component Deduct</div>
              <p className="text-slate-300">Assembly, Painting & Packing. Consumes 32 Legs, 8 Tops, 8 Screws.</p>
            </div>

            {/* Step 5 */}
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Step 5 — Delivery</div>
              <div className="font-bold text-emerald-300 text-sm">Stock Ledger Entry</div>
              <p className="text-slate-300">Output +8 tables to Finished Goods. SO Delivered & stock updated.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section id="features" className="relative z-10 py-20 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">5 Major ERP Modules</h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              End-to-End Operational Control
            </h3>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Every order, purchase, manufacturing task, and inventory movement works together as one connected system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product Module */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition space-y-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Package className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white">1. Product & Inventory Central</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Centralized inventory model supporting On-Hand Qty, Reserved Qty, and Free-To-Use Qty formula:
                <code className="block mt-2 p-2 rounded bg-slate-900 text-indigo-300 text-xs font-mono">
                  Free To Use Qty = On Hand Qty - Reserved Qty
                </code>
              </p>
              <Link href="/dashboard/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                Explore Product Module <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Bill of Materials */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <Layers className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white">2. Bill of Materials (BoM)</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Digital BoM architecture specifying required component quantities (Legs, Tops, Fasteners) and estimated step durations across Assembly, Paint Floor, and Packaging work centers.
              </p>
              <Link href="/dashboard/bom" className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300">
                Explore BoM Architecture <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Sales Module */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white">3. Sales Demand Processing</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Process customer demand with automatic stock reservation checks. Lifecycle steppers track orders from <span className="text-slate-200">Draft → Confirmed → Delivered</span> while triggering procurement automation on shortages.
              </p>
              <Link href="/dashboard/sales" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300">
                Explore Sales Orders <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Purchase Module */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white">4. Purchase & Replenishment</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Vendor management and purchase order tracking. Receiving raw components automatically increases physical stock, updates stock ledger entries, and satisfies backlog demand.
              </p>
              <Link href="/dashboard/purchase" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                Explore Purchase Orders <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Manufacturing Module */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Factory className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white">5. Manufacturing Execution</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Execute Work Orders (Assembly, Sanding, Painting, Packing) step-by-step. MO completion automatically consumes component stock and outputs finished goods to available inventory.
              </p>
              <Link href="/dashboard/manufacturing" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300">
                Explore Manufacturing Board <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Stock Ledger & Audit */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition space-y-4">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white">6. Ledger & System Audit Trail</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Immutable inventory movement ledger (+ / -) linking every transaction to reference documents (SO#, PO#, MO#), timestamps, and user activity audit logs.
              </p>
              <Link href="/dashboard/stock-ledger" className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300">
                Explore Stock Ledger <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Procurement Strategies (MTS vs MTO) */}
      <section id="procurement" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Automated Procurement Strategies</h2>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Make To Stock (MTS) vs Make To Order (MTO)
          </h3>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Configure each product with its optimal procurement strategy to streamline operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* MTS Card */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                MTS — Make To Stock
              </span>
              <span className="text-xs text-slate-400">Pre-manufactured</span>
            </div>
            <h4 className="text-2xl font-bold text-white">Manufactured Before Demand</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Standard products like <strong className="text-slate-200">Wooden Chairs (100 units in stock)</strong> are built or purchased in advance. When customer orders arrive, delivery occurs immediately from available stock without triggering new procurement.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
              <div className="text-emerald-400">Current Stock: 100 Wooden Chairs</div>
              <div>Customer Orders: 10 Wooden Chairs</div>
              <div className="text-slate-400">→ Result: Delivered directly from stock. No MO needed.</div>
            </div>
          </div>

          {/* MTO Card */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                MTO — Make To Order
              </span>
              <span className="text-xs text-slate-400">Demand-Triggered</span>
            </div>
            <h4 className="text-2xl font-bold text-white">Manufactured Upon Order</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Custom products like <strong className="text-slate-200">Wooden Tables (2 units in stock)</strong> trigger automated production or purchasing upon order confirmation to cover exact shortages without overstocking.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
              <div className="text-amber-400">Current Stock: 2 Tables | Customer Orders: 10 Tables</div>
              <div className="text-amber-300 font-bold">Shortage: 8 Tables</div>
              <div className="text-indigo-400">→ System Action: Auto-creates MO/PO for 8 units.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access Control Section */}
      <section id="roles" className="relative z-10 py-20 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Role-Based Access Control (RBAC)</h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Target User Responsibilities
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="font-bold text-white text-sm">Admin</div>
              <p className="text-[11px] text-slate-400">Full system access & settings</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="font-bold text-white text-sm">Sales User</div>
              <p className="text-[11px] text-slate-400">Manage sales orders & demand</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="font-bold text-white text-sm">Purchase User</div>
              <p className="text-[11px] text-slate-400">Manage vendor POs & receipts</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="font-bold text-white text-sm">Manufacturing</div>
              <p className="text-[11px] text-slate-400">Handle MOs & Work Orders</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="font-bold text-white text-sm">Inventory Mgr</div>
              <p className="text-[11px] text-slate-400">Track stock ledger movements</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="font-bold text-white text-sm">Business Owner</div>
              <p className="text-[11px] text-slate-400">Monitor executive KPIs & audit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-12 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
              S
            </div>
            <div>
              <div className="font-bold text-white text-sm">Shiv Furniture Works Mini ERP</div>
              <div>Digitally managing the complete business flow from demand to delivery</div>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-300">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/dashboard/products" className="hover:text-white">Products</Link>
            <Link href="/dashboard/sales" className="hover:text-white">Sales</Link>
            <Link href="/dashboard/manufacturing" className="hover:text-white">Manufacturing</Link>
            <Link href="/login" className="hover:text-white">Sign In</Link>
          </div>

          <div>
            © 2026 Shiv Furniture Works • Odoo Hackathon
          </div>
        </div>
      </footer>
    </div>
  );
}
