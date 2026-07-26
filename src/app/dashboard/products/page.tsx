'use client';

import React from 'react';
import { useErpData, useAddProductMutation } from '@/hooks/use-erp-query';
import { useErpStore } from '@/store/useErpStore';
import { ProductsView } from '@/components/erp/products-view';

export default function ProductsPage() {
  const { data: state, isLoading, isError } = useErpData();
  const addProductMutation = useAddProductMutation();
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
        Failed to load product data.
      </div>
    );
  }

  return (
    <ProductsView
      state={state}
      role={currentRole}
      onAddProduct={(prodData) => addProductMutation.mutate(prodData)}
    />
  );
}
