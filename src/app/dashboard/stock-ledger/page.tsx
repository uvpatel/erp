'use client';

import React from 'react';
import { useErpData } from '@/hooks/use-erp-query';
import { StockLedgerView } from '@/components/erp/stock-ledger-view';

export default function StockLedgerPage() {
  const { data: state, isLoading, isError } = useErpData();

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
        Failed to load stock ledger history.
      </div>
    );
  }

  return <StockLedgerView state={state} />;
}
