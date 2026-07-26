'use client';

import React, { useState } from 'react';
import { ErpState, StockLedgerRefType } from '@/lib/types';
import { Layers, Search, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

interface StockLedgerViewProps {
  state: ErpState;
}

export function StockLedgerView({ state }: StockLedgerViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [refTypeFilter, setRefTypeFilter] = useState<string>('ALL');

  const filteredEntries = state.stockLedger.filter((entry) => {
    const prod = state.products.find((p) => p.id === entry.productId);
    const matchesSearch =
      (entry.productName || prod?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = refTypeFilter === 'ALL' || entry.referenceType === refTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Stock Ledger & Inventory Traceability</h2>
        <p className="text-sm text-muted-foreground">
          Complete immutable record of all inventory movements: Sales Deliveries (-), Purchase Receipts (+), Manufacturing Consumptions (-), and Finished Goods Outputs (+).
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name or reference ID (SO#, PO#, MO#)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={refTypeFilter}
          onChange={(e) => setRefTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Movement Types</option>
          <option value="SO">Sales Order (SO-OUT)</option>
          <option value="PO">Purchase Order (PO-IN)</option>
          <option value="MO_CONSUMPTION">MO Consumption (MO-OUT)</option>
          <option value="MO_PRODUCTION">MO Production (MO-IN)</option>
        </select>
      </div>

      {/* Stock Ledger Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Product</th>
                <th className="p-4">Reference Doc</th>
                <th className="p-4 text-center">Movement Qty</th>
                <th className="p-4 text-center">Resulting On-Hand</th>
                <th className="p-4 text-center">Resulting Reserved</th>
                <th className="p-4">Triggered By</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEntries.map((entry) => {
                const prod = state.products.find((p) => p.id === entry.productId);
                const isPositive = entry.changeQty > 0;

                return (
                  <tr key={entry.id} className="hover:bg-muted/30 transition">
                    <td className="p-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-foreground">{entry.productName || prod?.name}</div>
                      <div className="text-xs text-muted-foreground">{entry.notes}</div>
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-indigo-600">
                      {entry.referenceId}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {isPositive ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                        {isPositive ? `+${entry.changeQty}` : entry.changeQty}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-foreground">{entry.resultingOnHand}</td>
                    <td className="p-4 text-center font-medium text-amber-600">{entry.resultingReserved}</td>
                    <td className="p-4 text-xs text-muted-foreground">{entry.createdBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
