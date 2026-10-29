import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Renglón de un pago: una factura incluida dentro de un pago a proveedor.
export interface RenglonPago {
  factura_id: string
  factura_consecutivo?: string | number
  nro_factura?: string
  concepto?: string
  monto_sin_impuesto?: number
  monto_iva?: number
  retencion_fuente?: number
  retencion_iva?: number
  anticipo?: number
  neto_a_pagar?: number
  monto_aplicado?: number
  [key: string]: any
}

// Aplicación de un anticipo a un pago.
export interface AnticipoAplicado {
  anticipo_id: string
  anticipo_consecutivo?: string | number
  monto_aplicado: number
  [key: string]: any
}

// Factura recibida de un proveedor.
export interface FacturaProveedor {
  id: string
  nro_correlativo?: number
  consecutivo?: string | number
  nro_factura?: string
  proveedor?: string
  concepto?: string
  fecha_registro?: string
  fecha_emision?: string
  fecha_vencimiento?: string
  monto_sin_impuesto?: number
  monto_iva?: number
  retencion_fuente?: number
  retencion_iva?: number
  monto_total?: number
  saldo_pendiente?: number
  anticipo?: number
  estado?: string
  tipo_moneda?: string
  tipo_inventario?: string
  [key: string]: any
}

// Pago realizado a un proveedor (puede cubrir varias facturas).
export interface PagoProveedor {
  id: string
  nro_correlativo?: number
  consecutivo?: string | number
  fecha_registro?: string
  proveedor?: string
  facturas_aplicadas: RenglonPago[]
  anticipos_aplicados?: AnticipoAplicado[]
  forma_pago?: string
  banco?: string
  nro_referencia?: string
  monto_total?: number
  monto_anticipos_aplicados?: number
  observaciones?: string
  estado?: string
  [key: string]: any
}

// Anticipo entregado a un proveedor, disponible para aplicar a pagos.
export interface AnticipoProveedor {
  id: string
  nro_correlativo?: number
  consecutivo?: string | number
  proveedor?: string
  monto?: number
  monto_aplicado?: number
  saldo_disponible?: number
  fecha_registro?: string
  forma_pago?: string
  banco?: string
  nro_referencia?: string
  persona_aprueba?: string
  concepto?: string
  observaciones?: string
  condiciones_pago?: string
  tipo_moneda?: string
  tipo_inventario?: string
  estado?: string
  [key: string]: any
}

interface PagosProveedoresState {
  facturas: FacturaProveedor[]
  pagos: PagoProveedor[]
  anticipos: AnticipoProveedor[]
  addFactura: (factura: FacturaProveedor) => void
  updateFactura: (id: string, patch: Partial<FacturaProveedor>) => void
  deleteFactura: (id: string) => void
  deleteAllFacturas: () => void
  addPago: (pago: PagoProveedor) => void
  addAnticipo: (anticipo: AnticipoProveedor) => void
  updateAnticipo: (id: string, patch: Partial<AnticipoProveedor>) => void
  deleteAnticipo: (id: string) => void
}

export const usePagosProveedoresStore = create<PagosProveedoresState>()(
  persist(
    (set) => ({
      facturas: [],
      pagos: [],
      anticipos: [],
      addFactura: (factura) =>
        set((state) => ({ facturas: [...state.facturas, factura] })),
      updateFactura: (id, patch) =>
        set((state) => ({
          facturas: state.facturas.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),
      deleteFactura: (id) =>
        set((state) => ({ facturas: state.facturas.filter((f) => f.id !== id) })),
      deleteAllFacturas: () => set({ facturas: [] }),
      addPago: (pago) =>
        set((state) => ({ pagos: [...state.pagos, pago] })),
      addAnticipo: (anticipo) =>
        set((state) => ({ anticipos: [...state.anticipos, anticipo] })),
      updateAnticipo: (id, patch) =>
        set((state) => ({
          anticipos: state.anticipos.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      deleteAnticipo: (id) =>
        set((state) => ({ anticipos: state.anticipos.filter((a) => a.id !== id) })),
    }),
    { name: 'pagos-proveedores-storage' }
  )
)
