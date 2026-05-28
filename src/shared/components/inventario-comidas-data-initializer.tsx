'use client'

import { useEffect } from 'react'
import { useDatosEmpresaComidasStore } from '@/features/inventario-comidas/store/datos-empresa-comidas-store'

export function InventarioComidasDataInitializer() {
  useEffect(() => {
    // Hydrate datos empresa from localStorage immediately on mount
    const hydrate = useDatosEmpresaComidasStore.getState().hydrate
    if (hydrate) {
      hydrate()
      console.log('[InventarioComidasDataInitializer] Hydrated datos-empresa-comidas')
    }
  }, [])

  return null
}
