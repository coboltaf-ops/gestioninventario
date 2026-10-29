import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Modulo {
  id: string
  activo: boolean
}

interface ModulosSistemaState {
  modulos: Modulo[]
  initModulos: (ids: string[]) => void
  toggleModulo: (id: string) => void
}

export const useModulosSistemaStore = create<ModulosSistemaState>()(
  persist(
    (set) => ({
      modulos: [],
      // Sincroniza la lista: conserva el estado de los módulos ya existentes
      // y agrega los nuevos como activos por defecto.
      initModulos: (ids) =>
        set((state) => {
          const existentes = new Map(state.modulos.map((m) => [m.id, m]))
          const modulos = ids.map((id) => existentes.get(id) ?? { id, activo: true })
          return { modulos }
        }),
      toggleModulo: (id) =>
        set((state) => ({
          modulos: state.modulos.map((m) =>
            m.id === id ? { ...m, activo: !m.activo } : m
          ),
        })),
    }),
    { name: 'modulos-sistema-storage' }
  )
)
