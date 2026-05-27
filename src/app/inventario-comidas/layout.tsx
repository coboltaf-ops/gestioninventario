'use client'

import { useState } from 'react'
import { InventarioSidebar } from '@/shared/components/inventario-sidebar'
import { SidebarProvider } from '@/shared/context/sidebar-context'
import { usePollingProductosComidas } from '@/features/inventario-comidas/hooks/use-polling-productos-comidas'
import { usePollingFormulasComidas } from '@/features/inventario-comidas/hooks/use-polling-formulas-comidas'
import { usePollingProveedoresComidas } from '@/features/inventario-comidas/hooks/use-polling-proveedores-comidas'
import { usePollingOrdenesComidas } from '@/features/inventario-comidas/hooks/use-polling-ordenes-comidas'
import { usePollingRecepcionComidas } from '@/features/inventario-comidas/hooks/use-polling-recepcion-comidas'
import { usePollingBodegasComidas } from '@/features/inventario-comidas/hooks/use-polling-bodegas-comidas'
import { usePollingAjustesComidas } from '@/features/inventario-comidas/hooks/use-polling-ajustes-comidas'
import { usePollingInventarioFisicoComidas } from '@/features/inventario-comidas/hooks/use-polling-inventario-fisico-comidas'
import { usePollingsSalidasComidas } from '@/features/inventario-comidas/hooks/use-polling-salidas-comidas'
import { usePollingUsuariosComidas } from '@/features/inventario-comidas/hooks/use-polling-usuarios-comidas'
import { usePollingDatosEmpresaComidas } from '@/features/inventario-comidas/hooks/use-polling-datos-empresa-comidas'
import { usePollingClientesComidas } from '@/features/inventario-comidas/hooks/use-polling-clientes-comidas'

function InventarioComidasDataLoader() {
  usePollingProductosComidas(5000)
  usePollingFormulasComidas(5000)
  usePollingProveedoresComidas(5000)
  usePollingOrdenesComidas(5000)
  usePollingRecepcionComidas(5000)
  usePollingBodegasComidas(5000)
  usePollingAjustesComidas(5000)
  usePollingInventarioFisicoComidas(5000)
  usePollingsSalidasComidas(5000)
  usePollingUsuariosComidas(5000)
  usePollingDatosEmpresaComidas(5000)
  usePollingClientesComidas(5000)
  return null
}

function InventarioComidasLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex' }}>
      <InventarioComidasDataLoader />
      {sidebarVisible && <InventarioSidebar onClose={() => setSidebarVisible(false)} />}
      <main style={{ flex: 1, marginLeft: sidebarVisible ? '256px' : '0', overflowY: 'auto', transition: 'margin-left 0.3s' }}>
        {!sidebarVisible && (
          <button
            onClick={() => setSidebarVisible(true)}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              padding: '12px 20px',
              background: '#ea580c',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              zIndex: 50,
            }}
          >
            ☰ Regresar al Menú
          </button>
        )}
        {children}
      </main>
    </div>
  )
}

export default function InventarioComidasLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <InventarioComidasLayoutContent>{children}</InventarioComidasLayoutContent>
    </SidebarProvider>
  )
}
