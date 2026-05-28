'use client'

import { useEffect, useState } from 'react'
import { useProveedoresStore } from '@/features/proveedores/store/proveedores-store'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { useOrdenesStore } from '@/features/ordenes-compra/store/ordenes-store'

export function DataInitializer() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load proveedores
        const provResponse = await fetch('/api/data/proveedores')
        if (provResponse.ok) {
          const provData = await provResponse.json()
          useProveedoresStore.setState({ proveedores: provData })
        }

        // Load productos
        const prodResponse = await fetch('/api/data/productos')
        if (prodResponse.ok) {
          const prodData = await prodResponse.json()
          useProductosStore.setState({ productos: prodData })
        }

        // Load órdenes de compra
        const ordenResponse = await fetch('/api/data/ordenes-compra')
        if (ordenResponse.ok) {
          const ordenData = await ordenResponse.json()
          useOrdenesStore.setState({ ordenes: ordenData })
        }

        setInitialized(true)
      } catch (error) {
        console.error('Error initializing data:', error)
        setInitialized(true)
      }
    }

    if (!initialized) {
      initializeData()
    }
  }, [initialized])

  return null
}
