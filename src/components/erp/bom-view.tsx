'use client';

import React, { useState } from 'react';
import { ErpState, BoM, UserRole } from '@/lib/types';
import { Layers, Clock, Wrench, CheckCircle, Package } from 'lucide-react';

interface BomViewProps {
  state: ErpState;
  role: UserRole;
}

export function BomView({ state, role }: BomViewProps) {
  const [selectedBomId, setSelectedBomId] = useState<string>(state.boms[0]?.id || '');

  const selectedBom = state.boms.find((b) => b.id === selectedBomId) || state.boms[0];
  const finishedProduct = state.products.find((p) => p.id === selectedBom?.productId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Bill of Materials (BoM) Architecture</h2>
        <p className="text-sm text-muted-foreground">
          Define component requirements and operational step durations for manufactured finished goods.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BoM Selector List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active BoMs ({state.boms.length})
          </h3>
          <div className="space-y-2">
            {state.boms.map((b) => {
              const prod = state.products.find((p) => p.id === b.productId);
              const isSelected = b.id === selectedBomId;

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBomId(b.id)}
                  className={`w-full text-left p-4 rounded-xl border transition shadow-sm ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-500/5 ring-1 ring-indigo-600'
                      : 'bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{b.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600">
                      1 Unit Output
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Target: <span className="font-medium text-foreground">{prod ? prod.name : 'Finished Good'}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>{b.components.length} Components</span>
                    <span>•</span>
                    <span>{b.operations.length} Work Steps</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed BoM View */}
        {selectedBom && (
          <div className="lg:col-span-2 space-y-6">
            {/* BoM Header Card */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Finished Product Target
                  </span>
                  <h3 className="text-xl font-bold">{finishedProduct ? finishedProduct.name : selectedBom.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedBom.description || 'Standard manufacturing assembly BoM'}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Output Batch</div>
                  <div className="text-lg font-bold text-emerald-600">{selectedBom.outputQty} Unit</div>
                </div>
              </div>

              {/* Component Requirements */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-indigo-600" />
                  Required Components per Unit
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedBom.components.map((comp) => {
                    const compProd = state.products.find((p) => p.id === comp.componentProductId);
                    return (
                      <div key={comp.id} className="p-3 border rounded-lg bg-muted/20">
                        <div className="text-xs text-muted-foreground font-mono">{compProd?.sku || 'RAW'}</div>
                        <div className="font-bold text-sm text-foreground mt-0.5">{compProd ? compProd.name : comp.componentProductId}</div>
                        <div className="mt-2 text-xs font-semibold text-indigo-600 bg-indigo-500/10 px-2 py-1 rounded inline-block">
                          {comp.quantity} x Units
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operations & Work Center Sequence */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Wrench className="h-4 w-4 text-indigo-600" />
                  Operations & Work Center Steps
                </h4>
                <div className="space-y-2">
                  {selectedBom.operations.map((op) => (
                    <div key={op.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {op.stepOrder}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{op.name}</div>
                          <div className="text-xs text-muted-foreground">Work Center: <span className="font-medium text-foreground">{op.workCenter}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{op.durationMinutes} Mins</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
