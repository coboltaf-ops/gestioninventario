import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Centro de costo: unidad a la que se imputan las salidas de almacén
export interface CentroCosto {
  id: string
  codigo: string
  descripcion: string
  situacion: string
}

interface CentrosCostoState {
  centros: CentroCosto[]
  addCentro: (centro: CentroCosto) => void
  updateCentro: (id: string, cambios: Partial<CentroCosto>) => void
  removeCentro: (id: string) => void
}

export const useCentrosCostoStore = create<CentrosCostoState>()(
  persist(
    (set) => ({
      centros: [],
      addCentro: (centro) => set((state) => ({ centros: [...state.centros, centro] })),
      updateCentro: (id, cambios) =>
        set((state) => ({
          centros: state.centros.map((c) => (c.id === id ? { ...c, ...cambios } : c)),
        })),
      removeCentro: (id) => set((state) => ({ centros: state.centros.filter((c) => c.id !== id) })),
    }),
    { name: 'centros-costo-store-storage' }
  )
)
