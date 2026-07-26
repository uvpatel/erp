'use client';

import React from 'react';
import {
  useErpData,
  useCompleteMoMutation,
  useCreateManufacturingOrderMutation,
} from '@/hooks/use-erp-query';
import { useErpStore } from '@/store/useErpStore';
import { ManufacturingView } from '@/components/erp/manufacturing-view';

export default function ManufacturingPage() {
  const { data: state, isLoading, isError } = useErpData();
  const completeMoMutation = useCompleteMoMutation();
  const createMoMutation = useCreateManufacturingOrderMutation();
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
        Failed to load manufacturing order data.
      </div>
    );
  }

  return (
    <ManufacturingView
      state={state}
      role={currentRole}
      onCompleteMo={(moId) => completeMoMutation.mutate({ moId, userName: `${currentRole.toUpperCase()} User` })}
      onCreateMo={(moData) => createMoMutation.mutate(moData)}
    />
  );
}
