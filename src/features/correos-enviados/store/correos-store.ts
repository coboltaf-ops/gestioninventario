import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CorreoEnviado {
  id: string
  fecha: string
  hora: string
  destinatario: string
  proveedor: string
  asunto: string
  mensaje: string
  consecutivo: string
  total: string
  tipo_moneda: string
  estado: 'Enviado' | 'Abierto en cliente'
}

interface CorreosState {
  correos: CorreoEnviado[]
  addCorreo: (correo: CorreoEnviado) => void
  deleteCorreo: (id: string) => void
  clearAll: () => void
}

export const useCorreosStore = create<CorreosState>()(
  persist(
    (set) => ({
      correos: [],
      addCorreo: (correo) => set((s) => ({ correos: [correo, ...s.correos] })),
      deleteCorreo: (id) => set((s) => ({ correos: s.correos.filter((c) => c.id !== id) })),
      clearAll: () => set({ correos: [] }),
    }),
    { name: 'correos-enviados-storage' }
  )
)
