import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OrdenProduccion {
  id: string
  [key: string]: any
}

interface OrdenesProduccionState {
  ordenes: OrdenProduccion[]
  addOrden: (orden: OrdenProduccion) => void
  updateOrden: (id: string, cambios: Partial<OrdenProduccion>) => void
  deleteOrden: (id: string) => void
}

export const useOrdenesProduccionStore = create<OrdenesProduccionState>()(
  persist(
    (set) => ({
      ordenes: [],
      addOrden: (orden) => set((state) => ({ ordenes: [...state.ordenes, orden] })),
      updateOrden: (id, cambios) =>
        set((state) => ({
          ordenes: state.ordenes.map((o) => (o.id === id ? { ...o, ...cambios } : o)),
        })),
      deleteOrden: (id) =>
        set((state) => ({ ordenes: state.ordenes.filter((o) => o.id !== id) })),
    }),
    { name: 'ordenes-produccion-storage' }
  )
)
