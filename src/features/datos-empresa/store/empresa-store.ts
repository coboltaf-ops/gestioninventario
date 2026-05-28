import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type DatosEmpresa = {
  id: string
  nombre: string
  nit: string
  razon_social: string
  correo: string
  telefono_oficina: string
  direccion: string
  ciudad: string
  pais: string
  representante_legal: string
  servidor_correo: string
  logo: string
}

interface EmpresaState {
  empresas: DatosEmpresa[]
  addEmpresa: (empresa: DatosEmpresa) => void
  updateEmpresa: (id: string, empresa: Partial<DatosEmpresa>) => void
  deleteEmpresa: (id: string) => void
  hydrate: () => void
}

const defaultEmpresa: DatosEmpresa = {
  id: '1',
  nombre: 'Mi Empresa',
  nit: '',
  razon_social: '',
  correo: '',
  telefono_oficina: '',
  direccion: '',
  ciudad: '',
  pais: 'Colombia',
  representante_legal: '',
  servidor_correo: '',
  logo: '',
}

export const useEmpresaStore = create<EmpresaState>()(
  persist(
    (set, get) => ({
      empresas: [defaultEmpresa],
      addEmpresa: (empresa) =>
        set((state) => ({
          empresas: [...state.empresas, empresa],
        })),
      updateEmpresa: (id, empresa) => {
        // Update in state
        set((state) => ({
          empresas: state.empresas.map((e) =>
            e.id === id ? { ...e, ...empresa } : e
          ),
        }))
        
        // Also save to localStorage explicitly to ensure persistence
        if (typeof window !== 'undefined') {
          const updated = get().empresas
          localStorage.setItem('empresa-storage', JSON.stringify({ state: { empresas: updated } }))
        }
      },
      deleteEmpresa: (id) =>
        set((state) => ({
          empresas: state.empresas.filter((e) => e.id !== id),
        })),
      hydrate: () => {
        // Manual hydration to ensure data is loaded
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('empresa-storage')
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              if (parsed.state?.empresas && Array.isArray(parsed.state.empresas)) {
                set({ empresas: parsed.state.empresas })
              }
            } catch (e) {
              console.error('Error hydrating empresa store:', e)
            }
          }
        }
      },
    }),
    {
      name: 'empresa-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Hydrate immediately
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Empresa store hydrated with:', state.empresas)
        }
      },
    }
  )
)
