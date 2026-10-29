import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LoteCelda {
  id: string
  [key: string]: any
}

interface LoteCeldaState {
  lotes: LoteCelda[]
  addLote: (lote: LoteCelda) => void
  updateLote: (id: string, cambios: Partial<LoteCelda>) => void
  deleteLote: (id: string) => void
}

export const useLoteCeldaStore = create<LoteCeldaState>()(
  persist(
    (set) => ({
      lotes: [],
      addLote: (lote) => set((state) => ({ lotes: [...state.lotes, lote] })),
      updateLote: (id, cambios) =>
        set((state) => ({
          lotes: state.lotes.map((l) => (l.id === id ? { ...l, ...cambios } : l)),
        })),
      deleteLote: (id) =>
        set((state) => ({ lotes: state.lotes.filter((l) => l.id !== id) })),
    }),
    { name: 'lote-celda-storage' }
  )
)
