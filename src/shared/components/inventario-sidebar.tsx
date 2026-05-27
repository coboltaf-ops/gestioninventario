'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

const CollapseSection = ({
  label,
  color,
  open,
  onToggle,
  children,
}: {
  label: string
  color: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) => (
  <div>
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span style={{ color }}>{label}</span>
      <span style={{ fontSize: '12px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        ▼
      </span>
    </button>
    {open && <div style={{ paddingLeft: '8px' }}>{children}</div>}
  </div>
)

const MenuItemLink = ({ name, href, icon, external, onNavigate }: { name: string; href: string; icon: string; external?: boolean; onNavigate?: () => void }) => {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={onNavigate}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        fontSize: '13px',
        color: isActive ? '#ea580c' : '#aaa',
        textDecoration: 'none',
        cursor: 'pointer',
        backgroundColor: isActive ? 'rgba(234, 88, 12, 0.1)' : 'transparent',
        borderRadius: '6px',
        marginBottom: '4px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget.style.color = '#fff')
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = isActive ? '#ea580c' : '#aaa'
        e.currentTarget.style.backgroundColor = isActive ? 'rgba(234, 88, 12, 0.1)' : 'transparent'
      }}
    >
      {icon && <span style={{ marginRight: '8px', fontSize: '14px' }}>{icon}</span>}
      {name}
      {external && <span style={{ marginLeft: '4px', fontSize: '10px' }}>↗</span>}
    </a>
  )
}

export function InventarioSidebar({ onClose }: { onClose?: () => void } = {}) {
  const pathname = usePathname()
  const [comidasOpen, setComidasOpen] = useState(pathname.startsWith('/inventario-comidas'))
  const [portalOpen, setPortalOpen] = useState(pathname.startsWith('/inventario-comidas/comidas'))

  const handleNavigate = () => {
    // Ocultar sidebar después de navegar a un módulo
    if (onClose) {
      setTimeout(onClose, 100)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '256px',
        height: '100vh',
        background: '#0f0f0f',
        borderRight: '1px solid #222',
        padding: '20px 12px',
        overflowY: 'auto',
        zIndex: 100,
      }}
    >
      <div style={{ marginBottom: '20px', paddingLeft: '8px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ea580c', margin: 0 }}>
          🍽️ Inventario Comidas
        </h1>
      </div>

      <CollapseSection label="📦 INVENTARIO" color="#ea580c" open={comidasOpen} onToggle={() => setComidasOpen(!comidasOpen)}>
        <div style={{ borderLeft: '3px solid #ea580c', paddingLeft: '12px', marginLeft: '-4px' }}>
          <MenuItemLink name="Clientes" href="/inventario-comidas/clientes" icon="👥" onNavigate={handleNavigate} />
          <MenuItemLink name="Proveedores" href="/inventario-comidas/proveedores" icon="🏢" onNavigate={handleNavigate} />
          <MenuItemLink name="Productos" href="/inventario-comidas/productos" icon="📦" onNavigate={handleNavigate} />
          <MenuItemLink name="Fórmulas" href="/inventario-comidas/formulas" icon="📖" onNavigate={handleNavigate} />
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '12px 0' }} />
          <MenuItemLink name="O. Compra" href="/inventario-comidas/ordenes-compra" icon="🛒" onNavigate={handleNavigate} />
          <MenuItemLink name="Recepción Facturas" href="/inventario-comidas/recepcion" icon="📋" onNavigate={handleNavigate} />
          <MenuItemLink name="Bodegas" href="/inventario-comidas/bodegas" icon="🏪" onNavigate={handleNavigate} />
          <MenuItemLink name="Salidas Bodega" href="/inventario-comidas/salidas" icon="📤" onNavigate={handleNavigate} />
          <MenuItemLink name="Ajustes Inv." href="/inventario-comidas/ajustes" icon="🔧" onNavigate={handleNavigate} />
          <MenuItemLink name="Inv. Físico" href="/inventario-comidas/inventario-fisico" icon="📊" onNavigate={handleNavigate} />
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '12px 0' }} />
          <MenuItemLink name="Datos Empresa" href="/inventario-comidas/datos-empresa" icon="🏛️" onNavigate={handleNavigate} />
          <MenuItemLink name="Usuarios" href="/inventario-comidas/usuarios" icon="👤" onNavigate={handleNavigate} />
        </div>
      </CollapseSection>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />

      <CollapseSection label="🍕 PORTAL COMIDAS" color="#ea580c" open={portalOpen} onToggle={() => setPortalOpen(!portalOpen)}>
        <div style={{ borderLeft: '3px solid #ea580c', paddingLeft: '12px', marginLeft: '-4px' }}>
          <MenuItemLink name="Landing" href="/inventario-comidas/comidas/landing" icon="🔗" external />
          <MenuItemLink name="QR Pedidos" href="/inventario-comidas/comidas/qr" icon="📱" external />
        </div>
      </CollapseSection>
    </div>
  )
}
