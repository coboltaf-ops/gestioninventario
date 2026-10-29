import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Tipos ────────────────────────────────────────────────────────────────
export interface Banco {
  id: string
  nombre_banco: string
  tipo_cuenta: string
  nro_cuenta: string
  fecha_saldo: string
  saldo: number
  estado: 'Activo' | 'Inactivo'
}

export interface Deposito {
  id: string
  nro_correlativo: number
  consecutivo: number
  fecha_registro: string
  banco_id: string
  banco_descripcion: string
  origen: string
  monto: number
  nro_referencia: string
  depositado_por: string
  concepto: string
  observaciones: string
  estado: 'Registrado' | 'Anulado'
}

export interface MovimientoBancario {
  id: string
  tipo_inventario?: string
  [key: string]: any
}

interface ControlBancarioState {
  bancos: Banco[]
  depositos: Deposito[]
  movimientos: MovimientoBancario[]
  addBanco: (banco: Banco) => void
  updateBanco: (id: string, cambios: Partial<Banco>) => void
  deleteBanco: (id: string) => void
  addDeposito: (deposito: Deposito) => void
  updateDeposito: (id: string, cambios: Partial<Deposito>) => void
  deleteDeposito: (id: string) => void
}

export const useControlBancarioStore = create<ControlBancarioState>()(
  persist(
    (set) => ({
      bancos: [],
      depositos: [],
      movimientos: [],
      addBanco: (banco) => set((s) => ({ bancos: [...s.bancos, banco] })),
      updateBanco: (id, cambios) =>
        set((s) => ({ bancos: s.bancos.map((b) => (b.id === id ? { ...b, ...cambios } : b)) })),
      deleteBanco: (id) => set((s) => ({ bancos: s.bancos.filter((b) => b.id !== id) })),
      addDeposito: (deposito) => set((s) => ({ depositos: [...s.depositos, deposito] })),
      updateDeposito: (id, cambios) =>
        set((s) => ({ depositos: s.depositos.map((d) => (d.id === id ? { ...d, ...cambios } : d)) })),
      deleteDeposito: (id) => set((s) => ({ depositos: s.depositos.filter((d) => d.id !== id) })),
    }),
    { name: 'control-bancario-storage' }
  )
)
