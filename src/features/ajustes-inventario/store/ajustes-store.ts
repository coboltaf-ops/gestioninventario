import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// La forma completa de un ajuste se define en la página que lo consume
// (tipo local `AjusteInventario`). Aquí solo necesitamos un contenedor
// persistido que los consumidores leen con `s.ajustes` y modifican con
// `useAjustesStore.setState(...)`. Se tipa como `any[]` para que la página
// pueda castear libremente a su propio tipo sin colisiones de nombres.
interface AjustesState {
  ajustes: any[]
}

export const useAjustesStore = create<AjustesState>()(
  persist(
    (): AjustesState => ({
      ajustes: [],
    }),
    { name: 'ajustes-inventario-storage' }
  )
)
