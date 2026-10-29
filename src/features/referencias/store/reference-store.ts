import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Item genérico de una tabla de referencia (ciudad, categoría, rol, etc.).
export interface ReferenceItem {
  id?: string
  descripcion?: string
  situacion?: boolean | string
  [key: string]: any
}

// Cada clave de `data` es el nombre de una tabla de referencia y su valor
// es la lista de items de esa tabla.
export interface ReferenceData {
  [key: string]: ReferenceItem[]
}

interface ReferenceState {
  data: ReferenceData
  // Agrega un item a la tabla indicada (crea la tabla si no existe).
  addItem: (tabla: string, item: ReferenceItem) => void
  // Fusiona cambios en el item que coincida por id dentro de la tabla.
  updateItem: (tabla: string, id: string, cambios: Partial<ReferenceItem>) => void
  // Elimina por id el item de la tabla indicada.
  deleteItem: (tabla: string, id: string) => void
}

// Valor inicial: todas las tablas de referencia conocidas vacías, para que
// los consumidores puedan hacer `.filter(...)` sin encontrarse un undefined.
const initialData: ReferenceData = {
  actividad_proveedor: [],
  categoria: [],
  celda: [],
  ciudad: [],
  clase_cliente: [],
  condiciones_pago: [],
  departamento: [],
  grupo: [],
  impuesto: [],
  pais: [],
  referencia_proveedor: [],
  roles: [],
  situacion_bodega: [],
  situacion_orden_compra: [],
  situacion_producto: [],
  situacion_proveedor: [],
  situacion_tarea: [],
  subgrupo: [],
  tipo_ajuste: [],
  tipo_formula: [],
  tipo_identificacion: [],
  tipo_inventario: [],
  tipo_moneda: [],
  unidad_medida: [],
}

export const useReferenceStore = create<ReferenceState>()(
  persist(
    (set) => ({
      data: initialData,

      addItem: (tabla, item) =>
        set((state) => {
          const nuevo: ReferenceItem = {
            ...item,
            id: item.id ?? crypto.randomUUID(),
          }
          const actuales = state.data[tabla] ?? []
          return {
            data: {
              ...state.data,
              [tabla]: [...actuales, nuevo],
            },
          }
        }),

      updateItem: (tabla, id, cambios) =>
        set((state) => {
          const actuales = state.data[tabla] ?? []
          return {
            data: {
              ...state.data,
              [tabla]: actuales.map((it) =>
                it.id === id ? { ...it, ...cambios } : it
              ),
            },
          }
        }),

      deleteItem: (tabla, id) =>
        set((state) => {
          const actuales = state.data[tabla] ?? []
          return {
            data: {
              ...state.data,
              [tabla]: actuales.filter((it) => it.id !== id),
            },
          }
        }),
    }),
    { name: 'reference-store-storage' }
  )
)
