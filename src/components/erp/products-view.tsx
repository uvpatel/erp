'use client';

import React, { useState } from 'react';
import { ErpState, Product, ProductCategory, ProcurementStrategy, ProcurementType, UserRole } from '@/lib/types';
import { getFreeToUseQty } from '@/lib/erp-engine';
import { Plus, Search, Filter, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface ProductsViewProps {
  state: ErpState;
  role: UserRole;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
}

export function ProductsView({ state, role, onAddProduct }: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [strategyFilter, setStrategyFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Finished Good');
  const [salesPrice, setSalesPrice] = useState<number>(100);
  const [costPrice, setCostPrice] = useState<number>(50);
  const [onHandQty, setOnHandQty] = useState<number>(10);
  const [procurementStrategy, setProcurementStrategy] = useState<ProcurementStrategy>('MTS');
  const [procurementType, setProcurementType] = useState<ProcurementType>('Manufacturing');
  const [procureOnDemand, setProcureOnDemand] = useState<boolean>(false);
  const [vendorId, setVendorId] = useState<string>('');

  const filteredProducts = state.products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStrat = strategyFilter === 'ALL' || p.procurementStrategy === strategyFilter;
    return matchesSearch && matchesCat && matchesStrat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    onAddProduct({
      name,
      sku,
      category,
      salesPrice: Number(salesPrice),
      costPrice: Number(costPrice),
      onHandQty: Number(onHandQty),
      reservedQty: 0,
      procurementStrategy,
      procurementType,
      procureOnDemand,
      vendorId: vendorId || undefined,
    });

    // Reset Form
    setName('');
    setSku('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Products & Inventory Central</h2>
          <p className="text-sm text-muted-foreground">
            Manage stock levels, cost/sales prices, and MTS (Make to Stock) vs MTO (Make to Order) strategies.
          </p>
        </div>
        {role !== 'sales' && role !== 'manufacturing' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        )}
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Finished Good">Finished Goods</option>
            <option value="Component">Components</option>
            <option value="Raw Material">Raw Materials</option>
          </select>
          <select
            value={strategyFilter}
            onChange={(e) => setStrategyFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Strategies</option>
            <option value="MTS">MTS (Make to Stock)</option>
            <option value="MTO">MTO (Make to Order)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b">
              <tr>
                <th className="p-4">Product / SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Prices</th>
                <th className="p-4">Strategy & Type</th>
                <th className="p-4 text-center">On Hand</th>
                <th className="p-4 text-center">Reserved</th>
                <th className="p-4 text-center">Free To Use</th>
                <th className="p-4">Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((p) => {
                const freeQty = getFreeToUseQty(p);
                const vendor = state.vendors.find((v) => v.id === p.vendorId);

                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition">
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">SKU: {p.sku}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.category === 'Finished Good'
                          ? 'bg-purple-500/10 text-purple-600'
                          : p.category === 'Component'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-slate-500/10 text-slate-600'
                      }`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold">${p.salesPrice}</div>
                      <div className="text-xs text-muted-foreground">Cost: ${p.costPrice}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          p.procurementStrategy === 'MTS' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'
                        }`}>
                          {p.procurementStrategy}
                        </span>
                        <span className="text-xs text-muted-foreground">• {p.procurementType}</span>
                      </div>
                      {p.procureOnDemand && (
                        <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
                          ⚡ Procure on Demand Enabled
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center font-semibold">{p.onHandQty}</td>
                    <td className="p-4 text-center font-medium text-amber-600">{p.reservedQty}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        freeQty > 5 ? 'bg-emerald-500/10 text-emerald-600' : freeQty > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {freeQty}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {vendor ? vendor.name : p.procurementType === 'Purchase' ? 'Unassigned' : 'Internal BoM'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Create New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Executive Desk"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TBL-003"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                  >
                    <option value="Finished Good">Finished Good</option>
                    <option value="Component">Component</option>
                    <option value="Raw Material">Raw Material</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Sales Price ($)</label>
                  <input
                    type="number"
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Procurement Strategy</label>
                  <select
                    value={procurementStrategy}
                    onChange={(e) => setProcurementStrategy(e.target.value as ProcurementStrategy)}
                    className="w-full px-3 py-2 border rounded-lg bg-card text-foreground font-semibold"
                  >
                    <option value="MTS">MTS (Make To Stock)</option>
                    <option value="MTO">MTO (Make To Order)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Procurement Type</label>
                  <select
                    value={procurementType}
                    onChange={(e) => setProcurementType(e.target.value as ProcurementType)}
                    className="w-full px-3 py-2 border rounded-lg bg-card text-foreground font-semibold"
                  >
                    <option value="Manufacturing">Manufacturing (BoM)</option>
                    <option value="Purchase">Purchase (Vendor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Initial On Hand Qty</label>
                  <input
                    type="number"
                    value={onHandQty}
                    onChange={(e) => setOnHandQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Vendor (if Purchase)</label>
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-card text-foreground"
                  >
                    <option value="">Select Vendor...</option>
                    {state.vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="procureDemand"
                  checked={procureOnDemand}
                  onChange={(e) => setProcureOnDemand(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="procureDemand" className="text-xs font-medium text-foreground">
                  Enable Procure on Demand (Auto-trigger replenishment when short)
                </label>
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
