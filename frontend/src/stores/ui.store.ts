import { create } from 'zustand'
import type { Transaction, TxType } from '@/types'

interface UiState {
  txnModal: { open: boolean; edit: Transaction | null; type: TxType }
  openAdd: (type?: TxType) => void
  openEdit: (txn: Transaction) => void
  closeTxn: () => void
}

/** App-wide UI state: the add/edit transaction sheet can be opened from any page or the tab bar. */
export const useUiStore = create<UiState>((set) => ({
  txnModal: { open: false, edit: null, type: 'expense' },
  openAdd: (type = 'expense') => set({ txnModal: { open: true, edit: null, type } }),
  openEdit: (txn) => set({ txnModal: { open: true, edit: txn, type: txn.type } }),
  closeTxn: () => set((s) => ({ txnModal: { ...s.txnModal, open: false } })),
}))
