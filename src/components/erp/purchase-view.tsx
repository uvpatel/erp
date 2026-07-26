'use client';

import React, { useState } from 'react';
import { ErpState, PurchaseOrder, UserRole } from '@/lib/types';
import { ShoppingBag, Plus, ArrowDownCircle, CheckCircle, Clock } from 'lucide-react';

interface PurchaseViewProps {
  state: ErpState;
  role: UserRole;
  onReceiveOrder: (poId: string) => void;
  onCreateOrder: (poData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => void;
}

export function PurchaseView({ state, role, onReceiveOrder, onCreateOrder }: PurchaseViewProps) {
  const [selectedPoId, setSelectedPoId] = useState<string | null>(state.purchaseOrders[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selectedVendorId, setSelectedVendorId] = useState(state.vendors[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(
    state.products.find((p) => p.procurementType === 'Purchase')?.id || state.products[0]?.id || ''
  );
  const [orderedQty, setOrderedQty] = useState(50);

  const selectedPo = state.purchaseOrders.find((p) => p.id === selectedPoId) || state.purchaseOrders[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = state.vendors.find((v) => v.id === selectedVendorId);
    const prod = state.products.find((p) => p.id === selectedProductId);
    if (!vendor || !prod) return;

    onCreateOrder({
      vendorName: vendor.name,
      vendorId: vendor.id,
      totalAmount: prod.costPrice * orderedQty,
      items: [
        {
          id: `poi-${Date.now()}`,
          purchaseOrderId: '',
          productId: prod.id,
          productName: prod.name,
          orderedQty,
          receivedQty: 0,
          unitCost: prod.costPrice,
        },
      ],
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Purchase Orders & Replenishment</h2>
          <p className="text-sm text-muted-foreground">
            Procure raw materials and components from vendors to maintain stock balances and satisfy demand.
          </p>
        </div>
        {role !== 'sales' && role !== 'manufacturing' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            New Purchase Order
          </button>
        )}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PO List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Purchase Orders ({state.purchaseOrders.length})
          </h3>
          <div className="space-y-2">
            {state.purchaseOrders.map((po) => {
              const isSelected = po.id === selectedPo?.id;
              return (
                <button
                  key={po.id}
                  onClick={() => setSelectedPoId(po.id)}
                  className={`w-full text-left p-4 rounded-xl border transition shadow-sm ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-600'
                      : 'bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm font-mono text-foreground">{po.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      po.status === 'received'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {po.status}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-foreground mt-1">{po.vendorName}</div>
                  {po.triggeredFromSoId && (
                    <div className="text-[11px] font-semibold text-amber-600 mt-1">
                      ⚡ Auto-Triggered for Sales Shortage
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                    <span>${po.totalAmount.toLocaleString()}</span>
                    <span>{new Date(po.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected PO Details */}
        {selectedPo && (
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600">{selectedPo.orderNumber}</span>
                  <h3 className="text-xl font-bold">{selectedPo.vendorName}</h3>
                  <p className="text-xs text-muted-foreground">Status: <span className="font-bold uppercase text-foreground">{selectedPo.status}</span></p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Order Total</div>
                  <div className="text-2xl font-bold text-emerald-600">${selectedPo.totalAmount.toLocaleString()}</div>
                </div>
              </div>

              {/* PO Line Items */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Purchased Items</h4>
                <div className="divide-y border rounded-lg overflow-hidden">
                  {selectedPo.items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between bg-card text-sm">
                      <div>
                        <div className="font-bold">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          Unit Cost: ${item.unitCost} • Ordered Qty: <span className="font-semibold text-foreground">{item.orderedQty}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">${(item.unitCost * item.orderedQty).toLocaleString()}</div>
                        <div className="text-xs text-emerald-600 font-medium">
                          {selectedPo.status === 'received' ? `Received: ${item.orderedQty}` : `Pending Receipt`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {selectedPo.status === 'received' ? 'Received & Inventory Replenished' : 'Ready for Receipt'}
                </span>

                {selectedPo.status !== 'received' && selectedPo.status !== 'cancelled' && (
                  <button
                    onClick={() => onReceiveOrder(selectedPo.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                  >
                    <ArrowDownCircle className="h-4 w-4" />
                    Receive Stock & Update Inventory
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Create Purchase Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Select Vendor</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                >
                  {state.vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Select Item to Procure</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                >
                  {state.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Cost: ${p.costPrice} (On Hand: {p.onHandQty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={orderedQty}
                  onChange={(e) => setOrderedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-500 shadow-sm"
                >
                  Create Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
