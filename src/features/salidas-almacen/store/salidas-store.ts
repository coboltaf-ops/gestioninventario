import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Renglón (producto) de una salida de almacén
export interface RenglonSalida {
  id: string
  codigo_producto: string
  descripcion: string
  unidad_medida: string
  cantidad: number
}

// Salida de almacén hacia un centro de costo
export interface SalidaAlmacen {
  id: string
  nro_salida: number
  consecutivo: string
  fecha_emision: string
  tipo_inventario: string
  bodega_salida_id: string
  bodega_salida_nombre: string
  persona_emite: string
  fecha_aprobacion: string
  centro_costo_id: string
  centro_costo_nombre: string
  observaciones: string
  renglones: RenglonSalida[]
  situacion: string
}

interface SalidasState {
  salidas: SalidaAlmacen[]
  addSalida: (salida: SalidaAlmacen) => void
  updateSalida: (id: string, cambios: Partial<SalidaAlmacen>) => void
  removeSalida: (id: string) => void
}

export const useSalidasStore = create<SalidasState>()(
  persist(
    (set) => ({
      salidas: [],
      addSalida: (salida) => set((state) => ({ salidas: [...state.salidas, salida] })),
      updateSalida: (id, cambios) =>
        set((state) => ({
          salidas: state.salidas.map((s) => (s.id === id ? { ...s, ...cambios } : s)),
        })),
      removeSalida: (id) => set((state) => ({ salidas: state.salidas.filter((s) => s.id !== id) })),
    }),
    { name: 'salidas-store-storage' }
  )
)
