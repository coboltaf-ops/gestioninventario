import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// La página de transferencias define su propio tipo Transferencia estricto,
// por lo que el store mantiene el arreglo flexible (any[]) para seguir siendo
// asignable a ese tipo local.
export interface Transferencia {
  id: string
  [key: string]: any
}

interface TransferenciasState {
  transferencias: any[]
}

export const useTransferenciasStore = create<TransferenciasState>()(
  persist(
    () => ({
      transferencias: [] as any[],
    }),
    { name: 'transferencias-storage' }
  )
)
