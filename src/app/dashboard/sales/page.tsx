'use client';

import React from 'react';
import {
  useErpData,
  useConfirmSalesOrderMutation,
  useDeliverSalesOrderMutation,
  useCreateSalesOrderMutation,
} from '@/hooks/use-erp-query';
import { useErpStore } from '@/store/useErpStore';
import { SalesView } from '@/components/erp/sales-view';

export default function SalesPage() {
  const { data: state, isLoading, isError } = useErpData();
  const confirmMutation = useConfirmSalesOrderMutation();
  const deliverMutation = useDeliverSalesOrderMutation();
  const createSoMutation = useCreateSalesOrderMutation();
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
        Failed to load sales order data.
      </div>
    );
  }

  const handleConfirmOrder = (soId: string) => {
    confirmMutation.mutate({ soId, userName: `${currentRole.toUpperCase()} User` });
    return { triggeredMOs: [], triggeredPOs: [] };
  };

  return (
    <SalesView
      state={state}
      role={currentRole}
      onConfirmOrder={handleConfirmOrder}
      onDeliverOrder={(soId) => deliverMutation.mutate({ soId, userName: `${currentRole.toUpperCase()} User` })}
      onCreateOrder={(soData) => createSoMutation.mutate(soData)}
    />
  );
}
