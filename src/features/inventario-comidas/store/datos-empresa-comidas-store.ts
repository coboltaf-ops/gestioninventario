import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DatosEmpresaComida } from '../types'

interface DatosEmpresaStore {
  datosEmpresa: DatosEmpresaComida | null
  setDatosEmpresa: (datos: DatosEmpresaComida) => void
  updateDatosEmpresa: (datos: Partial<DatosEmpresaComida>) => void
  hydrate: () => void
}

export const useDatosEmpresaComidasStore = create<DatosEmpresaStore>()(
  persist(
    (set, get) => ({
      datosEmpresa: null,
      setDatosEmpresa: (datos) => set({ datosEmpresa: datos }),
      updateDatosEmpresa: (datos) =>
        set((state) => ({
          datosEmpresa: state.datosEmpresa ? { ...state.datosEmpresa, ...datos } : null,
        })),
      hydrate: () => {
        // Manual hydration to ensure data is loaded from localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('datos-empresa-comidas-storage')
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              if (parsed.state?.datosEmpresa) {
                set({ datosEmpresa: parsed.state.datosEmpresa })
                console.log('[DatosEmpresaComidasStore] Hydrated with:', parsed.state.datosEmpresa)
              }
            } catch (e) {
              console.error('[DatosEmpresaComidasStore] Error hydrating:', e)
            }
          }
        }
      },
    }),
    {
      name: 'datos-empresa-comidas-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('[DatosEmpresaComidasStore] Rehydrated from localStorage:', state.datosEmpresa)
        }
      },
    }
  )
)
