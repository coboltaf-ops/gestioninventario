import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// HojaProceso: registro de movimiento de materia prima (entra/sale) en una celda.
export interface HojaProceso {
  id: string
  nro_correlativo?: number
  consecutivo?: string | number
  nro_operacion?: number
  fecha: string
  producto_id?: string
  codigo_producto?: string
  codigo_alterno?: string
  nombre_producto?: string
  unidad_medida?: string
  lote?: string
  nro_celda?: string
  codigo_materia_prima?: string
  proveedor_id?: string
  proveedor_nombre?: string
  fecha_remision?: string
  nro_remision?: string
  cantidad_kg?: number
  movimiento?: 'Entra' | 'Sale'
  observaciones?: string
  tipo_inventario?: string
  estado?: string
  [key: string]: any
}

interface HojaProcesoState {
  hojas: HojaProceso[]
  addHoja: (hoja: HojaProceso) => void
  updateHoja: (id: string, patch: Partial<HojaProceso>) => void
  deleteHoja: (id: string) => void
}

export const useHojaProcesoStore = create<HojaProcesoState>()(
  persist(
    (set) => ({
      hojas: [],
      addHoja: (hoja) =>
        set((state) => ({ hojas: [...state.hojas, hoja] })),
      updateHoja: (id, patch) =>
        set((state) => ({
          hojas: state.hojas.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
      deleteHoja: (id) =>
        set((state) => ({ hojas: state.hojas.filter((h) => h.id !== id) })),
    }),
    { name: 'hoja-proceso-storage' }
  )
)
