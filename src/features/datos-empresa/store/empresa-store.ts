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
  isHydrated: boolean
  addEmpresa: (empresa: DatosEmpresa) => void
  updateEmpresa: (id: string, empresa: Partial<DatosEmpresa>) => void
  deleteEmpresa: (id: string) => void
  hydrate: () => Promise<void>
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

// IndexedDB helpers para logos (sin límite de tamaño)
const saveLogoToIndexedDB = async (id: string, logo: string): Promise<void> => {
  if (!logo || typeof window === 'undefined') return
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('gestioninventario', 1)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result)
      req.onupgradeneeded = () => {
        const store = req.result.createObjectStore('logos', { keyPath: 'id' })
      }
    })

    const tx = db.transaction('logos', 'readwrite')
    const store = tx.objectStore('logos')
    await new Promise((resolve, reject) => {
      const req = store.put({ id, logo, timestamp: Date.now() })
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(null)
    })
    console.log('✅ Logo guardado en IndexedDB:', id)
  } catch (e) {
    console.error('❌ Error guardando logo en IndexedDB:', e)
  }
}

const loadLogoFromIndexedDB = async (id: string): Promise<string | null> => {
  if (typeof window === 'undefined') return null
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('gestioninventario', 1)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result)
      req.onupgradeneeded = () => {
        try {
          req.result.createObjectStore('logos', { keyPath: 'id' })
        } catch (e) {
          // Object store already exists
        }
      }
    })

    const tx = db.transaction('logos', 'readonly')
    const store = tx.objectStore('logos')
    return new Promise((resolve) => {
      const req = store.get(id)
      req.onsuccess = () => {
        const result = req.result?.logo || null
        if (result) console.log('✅ Logo cargado de IndexedDB:', id)
        resolve(result)
      }
      req.onerror = () => resolve(null)
    })
  } catch (e) {
    console.error('Error cargando logo de IndexedDB:', e)
    return null
  }
}

export const useEmpresaStore = create<EmpresaState>()(
  persist(
    (set, get) => ({
      empresas: [defaultEmpresa],
      isHydrated: false,
      addEmpresa: (empresa) => {
        const newState = [empresa]
        set({ empresas: newState })
      },
      updateEmpresa: (id, empresaUpdate) => {
        const currentEmpresas = get().empresas
        const updated = currentEmpresas.map((e) =>
          e.id === id ? { ...e, ...empresaUpdate } : e
        )
        
        // Si hay logo, guardarlo en IndexedDB
        if (empresaUpdate.logo) {
          saveLogoToIndexedDB(id, empresaUpdate.logo)
        }
        
        // Guardar en estado (sin logo en localStorage)
        set({ empresas: updated })
        console.log('✅ Empresa actualizada:', updated[0]?.nombre)
      },
      deleteEmpresa: (id) =>
        set((state) => ({
          empresas: state.empresas.filter((e) => e.id !== id),
        })),
      hydrate: async () => {
        if (typeof window === 'undefined') return
        
        try {
          // Cargar datos de localStorage (sin logos)
          const stored = localStorage.getItem('empresa-storage')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.state?.empresas && Array.isArray(parsed.state.empresas)) {
              // Cargar logos de IndexedDB
              const empresasConLogos = await Promise.all(
                parsed.state.empresas.map(async (e: DatosEmpresa) => {
                  const logo = await loadLogoFromIndexedDB(e.id)
                  return { ...e, logo: logo || '' }
                })
              )
              set({ empresas: empresasConLogos, isHydrated: true })
              console.log('✅ Store hidratado:', empresasConLogos[0]?.nombre)
            }
          } else {
            set({ isHydrated: true })
          }
        } catch (e) {
          console.error('❌ Error hidratando empresa store:', e)
          set({ isHydrated: true })
        }
      },
    }),
    {
      name: 'empresa-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // NO guardar logos en localStorage (muy grandes)
      partialize: (state) => ({
        empresas: state.empresas.map(e => ({ ...e, logo: '' })),
        isHydrated: state.isHydrated,
      }),
    }
  )
)
