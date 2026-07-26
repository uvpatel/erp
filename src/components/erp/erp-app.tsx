'use client';

import React, { useState, useEffect } from 'react';
import { ErpState, UserRole } from '@/lib/types';
import {
  loadErpState,
  saveErpState,
  resetErpState,
  confirmSalesOrder,
  deliverSalesOrder,
  receivePurchaseOrder,
  completeManufacturingOrder,
  addProduct,
  createSalesOrder,
  createPurchaseOrder,
  createManufacturingOrder,
} from '@/lib/erp-engine';
import { DashboardView } from './dashboard-view';
import { ProductsView } from './products-view';
import { BomView } from './bom-view';
import { SalesView } from './sales-view';
import { PurchaseView } from './purchase-view';
import { ManufacturingView } from './manufacturing-view';
import { StockLedgerView } from './stock-ledger-view';
import { AuditLogsView } from './audit-logs-view';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  ShoppingBag,
  Factory,
  ClipboardList,
  Shield,
  UserCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export function ErpApp() {
  const [state, setState] = useState<ErpState | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');

  useEffect(() => {
    setState(loadErpState());
  }, []);

  if (!state) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-semibold">Loading Shiv Furniture ERP...</span>
        </div>
      </div>
    );
  }

  // Handle Actions
  const handleConfirmSo = (soId: string) => {
    const res = confirmSalesOrder(state, soId, `${currentRole.toUpperCase()} User`);
    setState(res.state);
    return res;
  };

  const handleDeliverSo = (soId: string) => {
    const newState = deliverSalesOrder(state, soId, `${currentRole.toUpperCase()} User`);
    setState(newState);
  };

  const handleReceivePo = (poId: string) => {
    const newState = receivePurchaseOrder(state, poId, `${currentRole.toUpperCase()} User`);
    setState(newState);
  };

  const handleCompleteMo = (moId: string) => {
    const newState = completeManufacturingOrder(state, moId, `${currentRole.toUpperCase()} User`);
    setState(newState);
  };

  const handleAddProduct = (prodData: Parameters<typeof addProduct>[1]) => {
    const newState = addProduct(state, prodData);
    setState(newState);
  };

  const handleCreateSo = (soData: Parameters<typeof createSalesOrder>[1]) => {
    const newState = createSalesOrder(state, soData);
    setState(newState);
  };

  const handleCreatePo = (poData: Parameters<typeof createPurchaseOrder>[1]) => {
    const newState = createPurchaseOrder(state, poData);
    setState(newState);
  };

  const handleCreateMo = (moData: Parameters<typeof createManufacturingOrder>[1]) => {
    const newState = createManufacturingOrder(state, moData);
    setState(newState);
  };

  const handleResetData = () => {
    const newState = resetErpState();
    setState({ ...newState });
  };

  // Nav Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'sales', 'purchase', 'manufacturing', 'inventory', 'owner'] },
    { id: 'products', label: 'Products & Stock', icon: Package, roles: ['admin', 'sales', 'purchase', 'inventory', 'owner'] },
    { id: 'bom', label: 'Bill of Materials', icon: Layers, roles: ['admin', 'manufacturing', 'owner'] },
    { id: 'sales', label: 'Sales Orders', icon: ShoppingCart, roles: ['admin', 'sales', 'owner'] },
    { id: 'purchase', label: 'Purchase Orders', icon: ShoppingBag, roles: ['admin', 'purchase', 'owner'] },
    { id: 'manufacturing', label: 'Manufacturing', icon: Factory, roles: ['admin', 'manufacturing', 'owner'] },
    { id: 'ledger', label: 'Stock Ledger', icon: ClipboardList, roles: ['admin', 'inventory', 'owner'] },
    { id: 'audit', label: 'Audit Logs', icon: Shield, roles: ['admin', 'owner'] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <div className="min-h-screen bg-slate-950/5 text-foreground flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
            S
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
              Shiv Furniture Mini ERP
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Demand to Delivery
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Centralized Business System</div>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-muted/60 p-1 rounded-xl border text-xs">
            <UserCheck className="h-4 w-4 text-indigo-600 ml-1.5" />
            <span className="font-semibold text-muted-foreground">Active Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-card font-bold text-indigo-600 rounded-lg px-2.5 py-1 focus:outline-none border shadow-xs"
            >
              <option value="admin">Admin (Full Access)</option>
              <option value="sales">Sales User</option>
              <option value="purchase">Purchase User</option>
              <option value="manufacturing">Manufacturing User</option>
              <option value="inventory">Inventory Manager</option>
              <option value="owner">Business Owner</option>
            </select>
          </div>

          <button
            onClick={handleResetData}
            title="Reset to Initial Demo State"
            className="p-2 border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r bg-card/50 p-4 space-y-1 flex-shrink-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
            Modules Navigator
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              state={state}
              role={currentRole}
              onNavigate={(tab) => setActiveTab(tab)}
              onResetData={handleResetData}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              state={state}
              role={currentRole}
              onAddProduct={handleAddProduct}
            />
          )}

          {activeTab === 'bom' && (
            <BomView state={state} role={currentRole} />
          )}

          {activeTab === 'sales' && (
            <SalesView
              state={state}
              role={currentRole}
              onConfirmOrder={handleConfirmSo}
              onDeliverOrder={handleDeliverSo}
              onCreateOrder={handleCreateSo}
            />
          )}

          {activeTab === 'purchase' && (
            <PurchaseView
              state={state}
              role={currentRole}
              onReceiveOrder={handleReceivePo}
              onCreateOrder={handleCreatePo}
            />
          )}

          {activeTab === 'manufacturing' && (
            <ManufacturingView
              state={state}
              role={currentRole}
              onCompleteMo={handleCompleteMo}
              onCreateMo={handleCreateMo}
            />
          )}

          {activeTab === 'ledger' && (
            <StockLedgerView state={state} />
          )}

          {activeTab === 'audit' && (
            <AuditLogsView state={state} />
          )}
        </main>
      </div>
    </div>
  );
}
