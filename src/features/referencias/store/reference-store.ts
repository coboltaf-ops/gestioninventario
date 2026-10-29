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
    () => ({
      data: initialData,
    }),
    { name: 'reference-store-storage' }
  )
)
