import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TipoInventarioState {
  // Tipo de inventario activo en la sesión (ej: 'Producto Terminado', 'Materia Prima').
  // Cadena vacía = sin filtro / no seleccionado.
  tipoActivo: string
  setTipoActivo: (tipo: string | null) => void
}

export const useTipoInventarioSesion = create<TipoInventarioState>()(
  persist(
    (set) => ({
      tipoActivo: '',
      setTipoActivo: (tipo) => set({ tipoActivo: tipo ?? '' }),
    }),
    { name: 'tipo-inventario-storage' }
  )
)
