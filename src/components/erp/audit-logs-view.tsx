'use client';

import React, { useState } from 'react';
import { ErpState } from '@/lib/types';
import { ClipboardList, Search, ShieldCheck } from 'lucide-react';

interface AuditLogsViewProps {
  state: ErpState;
}

export function AuditLogsView({ state }: AuditLogsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  const filteredLogs = state.auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">System Audit Logs & Governance</h2>
        <p className="text-sm text-muted-foreground">
          Trace every status change, auto-procurement event, user action, and quantity adjustment.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search audit details or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Entity Types</option>
          <option value="SalesOrder">Sales Orders</option>
          <option value="PurchaseOrder">Purchase Orders</option>
          <option value="ManufacturingOrder">Manufacturing Orders</option>
          <option value="Product">Products</option>
          <option value="Inventory">Inventory</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Action</th>
                <th className="p-4">Activity Log Description</th>
                <th className="p-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition">
                  <td className="p-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/10 text-indigo-600">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-xs uppercase text-foreground">{log.action}</td>
                  <td className="p-4 text-sm text-foreground max-w-md">{log.details}</td>
                  <td className="p-4 text-xs font-medium text-muted-foreground">{log.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
