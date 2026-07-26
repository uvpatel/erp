import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ErpState, Product, SalesOrder, PurchaseOrder, ManufacturingOrder } from '@/lib/types';
import { useErpStore } from '@/store/useErpStore';

async function fetchErpState(): Promise<ErpState> {
  const res = await fetch('/api/erp');
  if (!res.ok) throw new Error('Failed to fetch ERP state');
  const json = await res.json();
  return json.data;
}

export function useErpData() {
  return useQuery({
    queryKey: ['erp-state'],
    queryFn: fetchErpState,
  });
}

export function useConfirmSalesOrderMutation() {
  const queryClient = useQueryClient();
  const setNotification = useErpStore((s) => s.setNotification);

  return useMutation({
    mutationFn: async ({ soId, userName }: { soId: string; userName: string }) => {
      const res = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_sales_order', soId, userName }),
      });
      if (!res.ok) throw new Error('Failed to confirm sales order');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['erp-state'] });
      if (data.triggeredMOs?.length > 0 || data.triggeredPOs?.length > 0) {
        setNotification({
          triggeredMOs: data.triggeredMOs || [],
          triggeredPOs: data.triggeredPOs || [],
        });
      }
    },
  });
}

export function useDeliverSalesOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ soId, userName }: { soId: string; userName: string }) => {
      const res = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deliver_sales_order', soId, userName }),
      });
      if (!res.ok) throw new Error('Failed to deliver sales order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-state'] });
    },
  });
}

export function useReceivePurchaseOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ poId, userName }: { poId: string; userName: string }) => {
      const res = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'receive_purchase_order', poId, userName }),
      });
      if (!res.ok) throw new Error('Failed to receive purchase order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-state'] });
    },
  });
}

export function useCompleteMoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moId, userName }: { moId: string; userName: string }) => {
      const res = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete_manufacturing_order', moId, userName }),
      });
      if (!res.ok) throw new Error('Failed to complete manufacturing order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-state'] });
    },
  });
}

export function useAddProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'createdAt'>) => {
      const res = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_product', product }),
      });
      if (!res.ok) throw new Error('Failed to add product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-state'] });
    },
  });
}

export function useCreateSalesOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (soData: Omit<SalesOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => {
      const res = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_sales_order', soData }),
      });
      if (!res.ok) throw new Error('Failed to create sales order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-state'] });
    },
  });
}

export function useCreatePurchaseOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (poData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => {
      const res = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_purchase_order', poData }),
      });
      if (!res.ok) throw new Error('Failed to create purchase order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-state'] });
    },
  });
}

export function useCreateManufacturingOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moData: { productId: string; targetQty: number; assignee?: string }) => {
      const res = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_manufacturing_order', moData }),
      });
      if (!res.ok) throw new Error('Failed to create manufacturing order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-state'] });
    },
  });
}

export function useResetErpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_data' }),
      });
      if (!res.ok) throw new Error('Failed to reset ERP state');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-state'] });
    },
  });
}
