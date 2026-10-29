import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Renglón de una orden de pedido
export interface DetallePedido {
  id: string
  codigo_producto: string
  descripcion: string
  cantidad: number
  unidad_medida: string
}

// Orden de pedido a proveedor
export interface Pedido {
  id: string
  nro_pedido: number
  consecutivo: string
  fecha_emision: string
  fecha_vencimiento: string
  proveedor: string
  fecha_llegada: string
  tipo_moneda: string
  comprador: string
  condicion_pago: string
  fecha_aprobacion: string
  observaciones: string
  detalles: DetallePedido[]
  bodega_llegada: string
  centro_costo: string
  situacion: string
  tipo_inventario?: string
}

interface PedidosState {
  pedidos: Pedido[]
  addPedido: (pedido: Pedido) => void
  updatePedido: (id: string, cambios: Partial<Pedido>) => void
  removePedido: (id: string) => void
}

export const usePedidosStore = create<PedidosState>()(
  persist(
    (set) => ({
      pedidos: [],
      addPedido: (pedido) => set((state) => ({ pedidos: [...state.pedidos, pedido] })),
      updatePedido: (id, cambios) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
        })),
      removePedido: (id) => set((state) => ({ pedidos: state.pedidos.filter((p) => p.id !== id) })),
    }),
    { name: 'pedidos-store-storage' }
  )
)
