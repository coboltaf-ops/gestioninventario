import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SaldoBodega, MovimientoBodega } from '../types'

// Re-exportamos los tipos para que los consumidores puedan importarlos
// directamente desde el store (p. ej. salidas-almacen, kardex, etc.)
export type { SaldoBodega, MovimientoBodega }

// Cada consumidor (p. ej. bodegas/page.tsx) define su propio tipo Bodega
// estricto, por lo que el store mantiene el arreglo flexible (any[]) para
// seguir siendo asignable a esos tipos locales.
export interface Bodega {
  id: string
  situacion?: string
  [key: string]: any
}

interface BodegasState {
  bodegas: any[]
  updateBodega: (id: string, cambios: Record<string, any>) => void
}

export const useBodegasStore = create<BodegasState>()(
  persist(
    (set) => ({
      bodegas: [],
      updateBodega: (id, cambios) =>
        set((state) => ({
          bodegas: state.bodegas.map((b) =>
            b.id === id ? { ...b, ...cambios } : b
          ),
        })),
    }),
    { name: 'bodegas-storage' }
  )
)
