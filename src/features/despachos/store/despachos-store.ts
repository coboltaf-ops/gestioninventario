import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Renglón (producto terminado) de un despacho a cliente
export interface RenglonDespacho {
  producto_id: string
  codigo: string
  codigo_spin: string
  nombre: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

// Despacho de producto terminado a un cliente
export interface Despacho {
  id: string
  nro_correlativo: number
  consecutivo: string
  fecha_registro: string
  fecha_emision: string
  cliente: string
  orden_compra: string
  renglones: RenglonDespacho[]
  cedula_conductor: string
  nombre_conductor: string
  descripcion_vehiculo: string
  ano_modelo: string
  hora_salida: string
  observaciones: string
  monto_total: number
  tipo_inventario: string
  estado: string
}

interface DespachosState {
  despachos: Despacho[]
  addDespacho: (despacho: Despacho) => void
  updateDespacho: (id: string, cambios: Partial<Despacho>) => void
  deleteDespacho: (id: string) => void
}

export const useDespachosStore = create<DespachosState>()(
  persist(
    (set) => ({
      despachos: [],
      addDespacho: (despacho) => set((state) => ({ despachos: [...state.despachos, despacho] })),
      updateDespacho: (id, cambios) =>
        set((state) => ({
          despachos: state.despachos.map((d) => (d.id === id ? { ...d, ...cambios } : d)),
        })),
      deleteDespacho: (id) => set((state) => ({ despachos: state.despachos.filter((d) => d.id !== id) })),
    }),
    { name: 'despachos-store-storage' }
  )
)
