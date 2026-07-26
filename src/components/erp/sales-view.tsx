'use client';

import React, { useState } from 'react';
import { ErpState, SalesOrder, UserRole } from '@/lib/types';
import { getFreeToUseQty } from '@/lib/erp-engine';
import { ShoppingCart, Plus, CheckCircle, Truck, AlertTriangle, Zap, Check } from 'lucide-react';

interface SalesViewProps {
  state: ErpState;
  role: UserRole;
  onConfirmOrder: (soId: string) => { triggeredMOs: string[]; triggeredPOs: string[] };
  onDeliverOrder: (soId: string) => void;
  onCreateOrder: (soData: Omit<SalesOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => void;
}

export function SalesView({ state, role, onConfirmOrder, onDeliverOrder, onCreateOrder }: SalesViewProps) {
  const [selectedSoId, setSelectedSoId] = useState<string | null>(state.salesOrders[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastNotification, setLastNotification] = useState<{ mo: string[]; po: string[] } | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(state.products[0]?.id || '');
  const [orderedQty, setOrderedQty] = useState(10);

  const selectedSo = state.salesOrders.find((s) => s.id === selectedSoId) || state.salesOrders[0];

  const handleConfirm = (soId: string) => {
    const res = onConfirmOrder(soId);
    setLastNotification({ mo: res.triggeredMOs, po: res.triggeredPOs });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = state.products.find((p) => p.id === selectedProductId);
    if (!customerName || !prod) return;

    onCreateOrder({
      customerName,
      customerEmail,
      totalAmount: prod.salesPrice * orderedQty,
      items: [
        {
          id: `soi-${Date.now()}`,
          salesOrderId: '',
          productId: prod.id,
          productName: prod.name,
          orderedQty,
          deliveredQty: 0,
          unitPrice: prod.salesPrice,
        },
      ],
    });

    setCustomerName('');
    setCustomerEmail('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Sales Orders Management</h2>
          <p className="text-sm text-muted-foreground">
            Customer demand processing, stock reservations, and automated procurement triggers (MTS / MTO).
          </p>
        </div>
        {role !== 'purchase' && role !== 'manufacturing' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            New Sales Order
          </button>
        )}
      </div>

      {/* Auto Procurement Notification Banner */}
      {lastNotification && (lastNotification.mo.length > 0 || lastNotification.po.length > 0) && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-bold">Procurement Automation Triggered!</div>
            <div className="mt-0.5">
              Stock shortage detected on Sales Order confirmation. System automatically generated:
              {lastNotification.mo.length > 0 && (
                <span className="font-semibold text-indigo-600 ml-1">
                  Manufacturing Order(s): {lastNotification.mo.join(', ')}
                </span>
              )}
              {lastNotification.po.length > 0 && (
                <span className="font-semibold text-emerald-600 ml-1">
                  Purchase Order(s): {lastNotification.po.join(', ')}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setLastNotification(null)}
            className="ml-auto text-xs font-semibold underline text-amber-700 hover:text-amber-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Order List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sales Orders ({state.salesOrders.length})
          </h3>
          <div className="space-y-2">
            {state.salesOrders.map((so) => {
              const isSelected = so.id === selectedSo?.id;
              return (
                <button
                  key={so.id}
                  onClick={() => setSelectedSoId(so.id)}
                  className={`w-full text-left p-4 rounded-xl border transition shadow-sm ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-600'
                      : 'bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm font-mono text-foreground">{so.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      so.status === 'delivered'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : so.status === 'confirmed'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {so.status}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-foreground mt-1">{so.customerName}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                    <span>${so.totalAmount.toLocaleString()}</span>
                    <span>{new Date(so.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Sales Order Details & Workflow */}
        {selectedSo && (
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              {/* Stepper Status Indicator */}
              <div className="border-b pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-600">{selectedSo.orderNumber}</span>
                    <h3 className="text-xl font-bold">{selectedSo.customerName}</h3>
                    <p className="text-xs text-muted-foreground">{selectedSo.customerEmail || 'No email provided'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Order Total</div>
                    <div className="text-2xl font-bold text-foreground">${selectedSo.totalAmount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Workflow Stepper */}
                <div className="flex items-center justify-between max-w-md mx-auto pt-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold">Draft</span>
                  </div>
                  <div className={`h-1 flex-1 mx-2 rounded ${selectedSo.status !== 'draft' ? 'bg-emerald-600' : 'bg-muted'}`} />
                  <div className="flex flex-col items-center gap-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      selectedSo.status === 'confirmed' || selectedSo.status === 'delivered'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      2
                    </div>
                    <span className="text-[11px] font-semibold">Confirmed</span>
                  </div>
                  <div className={`h-1 flex-1 mx-2 rounded ${selectedSo.status === 'delivered' ? 'bg-emerald-600' : 'bg-muted'}`} />
                  <div className="flex flex-col items-center gap-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      selectedSo.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      3
                    </div>
                    <span className="text-[11px] font-semibold">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Order Line Items</h4>
                <div className="divide-y border rounded-lg overflow-hidden">
                  {selectedSo.items.map((item) => {
                    const prod = state.products.find((p) => p.id === item.productId);
                    const freeQty = prod ? getFreeToUseQty(prod) : 0;
                    const isShortage = freeQty < item.orderedQty && selectedSo.status === 'draft';

                    return (
                      <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card">
                        <div>
                          <div className="font-bold text-sm">{item.productName || prod?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Unit Price: ${item.unitPrice} • Ordered Qty: <span className="font-semibold text-foreground">{item.orderedQty}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {selectedSo.status === 'draft' && (
                            <div className="text-xs">
                              {isShortage ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 flex items-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5" /> Shortage of {item.orderedQty - freeQty} (Will Auto-Procure)
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
                                  <CheckCircle className="h-3.5 w-3.5" /> Stock Available (Free: {freeQty})
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-sm font-bold text-foreground">
                            ${(item.unitPrice * item.orderedQty).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Status: <span className="font-bold uppercase text-foreground">{selectedSo.status}</span>
                </span>

                <div className="flex gap-2">
                  {selectedSo.status === 'draft' && (
                    <button
                      onClick={() => handleConfirm(selectedSo.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                      <Zap className="h-4 w-4" />
                      Confirm Order & Trigger Procurement
                    </button>
                  )}

                  {selectedSo.status === 'confirmed' && (
                    <button
                      onClick={() => onDeliverOrder(selectedSo.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                      <Truck className="h-4 w-4" />
                      Deliver Order & Deduct Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create SO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Create Sales Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Customer Email</label>
                <input
                  type="email"
                  placeholder="customer@acme.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                >
                  {state.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.salesPrice} (Free Stock: {getFreeToUseQty(p)}) [{p.procurementStrategy}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Quantity</label>
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
                  Create Draft Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
