'use client';

import React from 'react';
import {
  useErpData,
  useReceivePurchaseOrderMutation,
  useCreatePurchaseOrderMutation,
} from '@/hooks/use-erp-query';
import { useErpStore } from '@/store/useErpStore';
import { PurchaseView } from '@/components/erp/purchase-view';

export default function PurchasePage() {
  const { data: state, isLoading, isError } = useErpData();
  const receiveMutation = useReceivePurchaseOrderMutation();
  const createPoMutation = useCreatePurchaseOrderMutation();
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
        Failed to load purchase order data.
      </div>
    );
  }

  return (
    <PurchaseView
      state={state}
      role={currentRole}
      onReceiveOrder={(poId) => receiveMutation.mutate({ poId, userName: `${currentRole.toUpperCase()} User` })}
      onCreateOrder={(poData) => createPoMutation.mutate(poData)}
    />
  );
}
