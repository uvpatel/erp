import { create } from 'zustand';
import { UserRole } from '@/lib/types';

interface ProcurementNotification {
  triggeredMOs: string[];
  triggeredPOs: string[];
}

interface ErpStoreState {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  notification: ProcurementNotification | null;
  setNotification: (notification: ProcurementNotification | null) => void;
  isAddProductOpen: boolean;
  setAddProductOpen: (open: boolean) => void;
  isCreateSoOpen: boolean;
  setCreateSoOpen: (open: boolean) => void;
  isCreatePoOpen: boolean;
  setCreatePoOpen: (open: boolean) => void;
  isCreateMoOpen: boolean;
  setCreateMoOpen: (open: boolean) => void;
}

export const useErpStore = create<ErpStoreState>((set) => ({
  currentRole: 'admin',
  setRole: (role) => set({ currentRole: role }),
  notification: null,
  setNotification: (notification) => set({ notification }),
  isAddProductOpen: false,
  setAddProductOpen: (isAddProductOpen) => set({ isAddProductOpen }),
  isCreateSoOpen: false,
  setCreateSoOpen: (isCreateSoOpen) => set({ isCreateSoOpen }),
  isCreatePoOpen: false,
  setCreatePoOpen: (isCreatePoOpen) => set({ isCreatePoOpen }),
  isCreateMoOpen: false,
  setCreateMoOpen: (isCreateMoOpen) => set({ isCreateMoOpen }),
}));
