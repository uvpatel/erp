'use client';

import React, { useState } from 'react';
import { ErpState, ManufacturingOrder, UserRole } from '@/lib/types';
import { Factory, Plus, CheckCircle2, Clock, Wrench, Package, Layers, Play } from 'lucide-react';

interface ManufacturingViewProps {
  state: ErpState;
  role: UserRole;
  onCompleteMo: (moId: string) => void;
  onCreateMo: (moData: { productId: string; targetQty: number; assignee?: string }) => void;
}

export function ManufacturingView({ state, role, onCompleteMo, onCreateMo }: ManufacturingViewProps) {
  const [selectedMoId, setSelectedMoId] = useState<string | null>(state.manufacturingOrders[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState(
    state.products.find((p) => p.procurementType === 'Manufacturing')?.id || state.products[0]?.id || ''
  );
  const [targetQty, setTargetQty] = useState(10);
  const [assignee, setAssignee] = useState('Rajesh Sharma (Lead Assembler)');

  const selectedMo = state.manufacturingOrders.find((m) => m.id === selectedMoId) || state.manufacturingOrders[0];
  const bom = state.boms.find((b) => b.id === selectedMo?.bomId) || state.boms[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    onCreateMo({
      productId: selectedProductId,
      targetQty: Number(targetQty),
      assignee,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Manufacturing & Work Orders Execution</h2>
          <p className="text-sm text-muted-foreground">
            Convert raw component inventory into finished goods through BoMs and Work Center operations.
          </p>
        </div>
        {role !== 'sales' && role !== 'purchase' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            New Manufacturing Order
          </button>
        )}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MO List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Manufacturing Orders ({state.manufacturingOrders.length})
          </h3>
          <div className="space-y-2">
            {state.manufacturingOrders.map((mo) => {
              const isSelected = mo.id === selectedMo?.id;
              return (
                <button
                  key={mo.id}
                  onClick={() => setSelectedMoId(mo.id)}
                  className={`w-full text-left p-4 rounded-xl border transition shadow-sm ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-600'
                      : 'bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm font-mono text-foreground">{mo.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      mo.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-indigo-500/10 text-indigo-600'
                    }`}>
                      {mo.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-foreground mt-1">{mo.productName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Target Output: <span className="font-semibold">{mo.targetQty} Units</span></div>
                  {mo.triggeredFromSoId && (
                    <div className="text-[11px] font-semibold text-amber-600 mt-1">
                      ⚡ Auto-Triggered for MTO Shortage
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected MO Details & Work Orders */}
        {selectedMo && (
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600">{selectedMo.orderNumber}</span>
                  <h3 className="text-xl font-bold">{selectedMo.productName}</h3>
                  <p className="text-xs text-muted-foreground">Assigned Operator: <span className="font-medium text-foreground">{selectedMo.assignee || 'Unassigned'}</span></p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Target Production Batch</div>
                  <div className="text-2xl font-bold text-indigo-600">{selectedMo.targetQty} Units</div>
                </div>
              </div>

              {/* Components Consumption Preview */}
              {bom && (
                <div className="mt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Raw Components Consumed on Completion
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {bom.components.map((comp) => {
                      const compProd = state.products.find((p) => p.id === comp.componentProductId);
                      const totalQty = comp.quantity * selectedMo.targetQty;
                      return (
                        <div key={comp.id} className="p-3 border rounded-lg bg-muted/20 text-xs">
                          <div className="font-medium">{compProd?.name || comp.componentProductId}</div>
                          <div className="text-indigo-600 font-bold mt-1">
                            -{totalQty} Units needed
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Work Orders Execution Steps */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Wrench className="h-4 w-4 text-indigo-600" />
                  Work Order Steps Progress
                </h4>
                <div className="space-y-2">
                  {selectedMo.workOrders.map((wo, idx) => (
                    <div key={wo.id} className="flex items-center justify-between p-3.5 border rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          selectedMo.status === 'completed' || wo.status === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{wo.name}</div>
                          <div className="text-xs text-muted-foreground">Work Center: <span className="font-medium text-foreground">{wo.workCenter}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          selectedMo.status === 'completed' || wo.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {selectedMo.status === 'completed' ? 'completed' : wo.status}
                        </span>
                        <span className="text-xs text-muted-foreground">({wo.durationMinutes} mins)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Status: <span className="font-bold uppercase text-foreground">{selectedMo.status}</span>
                </span>

                {selectedMo.status !== 'completed' && selectedMo.status !== 'cancelled' && (
                  <button
                    onClick={() => onCompleteMo(selectedMo.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Complete MO (Deduct Raw Components & Add Finished Goods)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create MO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Create Manufacturing Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Select Manufactured Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                >
                  {state.products
                    .filter((p) => p.category === 'Finished Good' || p.procurementType === 'Manufacturing')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Target Production Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={targetQty}
                  onChange={(e) => setTargetQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Assignee / Lead Operator</label>
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
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
                  Create & Confirm MO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
