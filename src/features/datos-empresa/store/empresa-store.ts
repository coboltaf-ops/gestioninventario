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
      addEmpresa: (empresa) => {
        const newState = [empresa]
        set({ empresas: newState })
        if (typeof window !== 'undefined') {
          localStorage.setItem('empresa-storage', JSON.stringify({ state: { empresas: newState }, version: 1 }))
        }
      },
      updateEmpresa: (id, empresaUpdate) => {
        // Update state FIRST, get the updated value, THEN save to localStorage
        const currentEmpresas = get().empresas
        const updated = currentEmpresas.map((e) =>
          e.id === id ? { ...e, ...empresaUpdate } : e
        )
        
        // Update state
        set({ empresas: updated })
        
        // Immediately save to localStorage (synchronously)
        if (typeof window !== 'undefined') {
          try {
            const toSave = JSON.stringify({ state: { empresas: updated }, version: 1 })
            localStorage.setItem('empresa-storage', toSave)
            console.log('✅ Logo guardado en localStorage:', { id, nombre: updated[0]?.nombre, logoSize: updated[0]?.logo?.length })
          } catch (e) {
            console.error('❌ Error guardando en localStorage:', e)
          }
        }
      },
      deleteEmpresa: (id) =>
        set((state) => ({
          empresas: state.empresas.filter((e) => e.id !== id),
        })),
      hydrate: () => {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('empresa-storage')
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              if (parsed.state?.empresas && Array.isArray(parsed.state.empresas)) {
                set({ empresas: parsed.state.empresas })
                console.log('✅ Store hidratado desde localStorage:', parsed.state.empresas)
              }
            } catch (e) {
              console.error('❌ Error hidratando empresa store:', e)
            }
          } else {
            console.warn('⚠️ No hay datos en localStorage')
          }
        }
      },
    }),
    {
      name: 'empresa-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.empresas) {
          console.log('🔧 Store Zustand rehydrated:', state.empresas[0]?.nombre)
        }
      },
    }
  )
)
