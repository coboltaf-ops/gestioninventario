import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Pesaje {
  id: string
  nro_correlativo: number
  consecutivo: string
  fecha_registro: string
  nro_documento: string
  fecha_emision: string
  proveedor: string
  orden_compra_id: string
  orden_compra_consecutivo: string
  producto_id: string
  producto_materia_prima: string
  placas: string
  descripcion: string
  modelo: string
  cedula_conductor: string
  nombre_conductor: string
  primera_pesada: number
  segunda_pesada: number
  peso_neto: number
  nro_lote: string
  observaciones: string
  tipo_inventario: string
  estado: string
  [key: string]: any
}

interface PesajeState {
  pesajes: Pesaje[]
  addPesaje: (pesaje: Pesaje) => void
  updatePesaje: (id: string, cambios: Partial<Pesaje>) => void
  deletePesaje: (id: string) => void
}

export const usePesajeStore = create<PesajeState>()(
  persist(
    (set) => ({
      pesajes: [],
      addPesaje: (pesaje) =>
        set((state) => ({ pesajes: [...state.pesajes, pesaje] })),
      updatePesaje: (id, cambios) =>
        set((state) => ({
          pesajes: state.pesajes.map((p) =>
            p.id === id ? { ...p, ...cambios } : p
          ),
        })),
      deletePesaje: (id) =>
        set((state) => ({
          pesajes: state.pesajes.filter((p) => p.id !== id),
        })),
    }),
    { name: 'pesaje-storage' }
  )
)
