import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AjusteMP {
  id: string
  [key: string]: any
}

interface AjustesMPState {
  ajustes: AjusteMP[]
  addAjuste: (ajuste: AjusteMP) => void
  deleteAjuste: (id: string) => void
}

export const useAjustesMPStore = create<AjustesMPState>()(
  persist(
    (set) => ({
      ajustes: [],
      addAjuste: (ajuste) => set((state) => ({ ajustes: [...state.ajustes, ajuste] })),
      deleteAjuste: (id) =>
        set((state) => ({ ajustes: state.ajustes.filter((a) => a.id !== id) })),
    }),
    { name: 'ajustes-mp-storage' }
  )
)
