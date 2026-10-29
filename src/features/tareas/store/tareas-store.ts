import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tarea: representa una tarea asignada a una persona dentro de la empresa.
export interface Tarea {
  id: string
  consecutivo?: string | number
  descripcion?: string
  situacion?: string
  persona_asigna_id?: string
  persona_asigna_nombre?: string
  persona_ejecuta_id?: string
  persona_ejecuta_nombre?: string
  fecha_asignacion?: string
  hora_asignacion?: string
  fecha_requerida_finalizar?: string
  tipo_inventario?: string
  [key: string]: any
}

interface TareasState {
  tareas: Tarea[]
  addTarea: (tarea: Tarea) => void
  updateTarea: (id: string, patch: Partial<Tarea>) => void
  deleteTarea: (id: string) => void
}

export const useTareasStore = create<TareasState>()(
  persist(
    (set) => ({
      tareas: [],
      addTarea: (tarea) =>
        set((state) => ({ tareas: [...state.tareas, tarea] })),
      updateTarea: (id, patch) =>
        set((state) => ({
          tareas: state.tareas.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTarea: (id) =>
        set((state) => ({ tareas: state.tareas.filter((t) => t.id !== id) })),
    }),
    { name: 'tareas-storage' }
  )
)
