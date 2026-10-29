import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CargaInicial {
  id: string
  [key: string]: any
}

interface CargaInicialState {
  cargas: CargaInicial[]
  addCarga: (carga: CargaInicial) => void
  deleteCarga: (id: string) => void
}

export const useCargaInicialStore = create<CargaInicialState>()(
  persist(
    (set) => ({
      cargas: [],
      addCarga: (carga) => set((state) => ({ cargas: [...state.cargas, carga] })),
      deleteCarga: (id) =>
        set((state) => ({ cargas: state.cargas.filter((c) => c.id !== id) })),
    }),
    { name: 'carga-inicial-storage' }
  )
)
