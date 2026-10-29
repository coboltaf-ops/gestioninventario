import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Recepcion {
  id: string
  [key: string]: any
}

interface RecepcionesState {
  recepciones: Recepcion[]
  updateRecepcion: (id: string, cambios: Partial<Recepcion>) => void
}

export const useRecepcionesStore = create<RecepcionesState>()(
  persist(
    (set) => ({
      recepciones: [],
      updateRecepcion: (id, cambios) =>
        set((state) => ({
          recepciones: state.recepciones.map((r) =>
            r.id === id ? { ...r, ...cambios } : r
          ),
        })),
    }),
    { name: 'recepciones-storage' }
  )
)
