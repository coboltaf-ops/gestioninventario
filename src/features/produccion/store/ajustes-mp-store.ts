import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Ajuste de materia prima dentro del módulo de producción.
export interface AjusteMP {
  id: string
  [key: string]: any
}

interface AjustesMPState {
  ajustes: AjusteMP[]
  addAjuste: (ajuste: AjusteMP) => void
  updateAjuste: (id: string, patch: Partial<AjusteMP>) => void
  deleteAjuste: (id: string) => void
}

export const useAjustesMPStore = create<AjustesMPState>()(
  persist(
    (set) => ({
      ajustes: [],
      addAjuste: (ajuste) =>
        set((state) => ({ ajustes: [...state.ajustes, ajuste] })),
      updateAjuste: (id, patch) =>
        set((state) => ({
          ajustes: state.ajustes.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      deleteAjuste: (id) =>
        set((state) => ({ ajustes: state.ajustes.filter((a) => a.id !== id) })),
    }),
    { name: 'produccion-ajustes-mp-storage' }
  )
)
