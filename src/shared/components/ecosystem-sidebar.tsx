'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCurrentUserStore } from '@/features/usuarios/store/current-user-store'

type NavItem = { id: string; label: string; icon: string }
type NavGroup = { titulo: string; items: NavItem[] }

// Navegación del sistema. Cada `id` corresponde a una ruta real en app/(main)/<id>.
const NAV: NavGroup[] = [
  {
    titulo: 'Principal',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: '📊' }],
  },
  {
    titulo: 'Dashboards',
    items: [
      { id: 'dashboard-mp', label: 'Dashboard Materia Prima', icon: '🔶' },
      { id: 'dashboard-ms', label: 'Dashboard Materiales y Suministros', icon: '🔷' },
      { id: 'dashboard-pt', label: 'Dashboard Producto Terminado', icon: '🟢' },
    ],
  },
  {
    titulo: 'Inventario',
    items: [
      { id: 'productos', label: 'Productos', icon: '📦' },
      { id: 'bodegas', label: 'Bodegas', icon: '🏭' },
      { id: 'kardex', label: 'Kardex', icon: '📒' },
      { id: 'toma-inventario-fisico', label: 'Toma Inventario Físico', icon: '📋' },
      { id: 'ajustes-inventario', label: 'Ajustes de Inventario', icon: '⚖️' },
      { id: 'transferencias', label: 'Transferencias', icon: '🔄' },
      { id: 'carga-inicial-inventario', label: 'Carga Inicial', icon: '📥' },
    ],
  },
  {
    titulo: 'Compras',
    items: [
      { id: 'proveedores', label: 'Proveedores', icon: '🏢' },
      { id: 'ordenes-compra', label: 'Órdenes de Compra', icon: '🛒' },
      { id: 'recepcion-facturas', label: 'Recepción de Facturas', icon: '🧾' },
      { id: 'pedidos', label: 'Pedidos', icon: '📄' },
      { id: 'pagos-proveedores', label: 'Pagos a Proveedores', icon: '💵' },
    ],
  },
  {
    titulo: 'Producción',
    items: [
      { id: 'formulas', label: 'Fórmulas', icon: '🧪' },
      { id: 'ordenes-produccion', label: 'Órdenes de Producción', icon: '🏗️' },
      { id: 'ejecucion-produccion', label: 'Ejecución de Producción', icon: '⚙️' },
      { id: 'hoja-proceso', label: 'Hoja de Proceso', icon: '📝' },
      { id: 'ajustes-materia-prima', label: 'Ajustes Materia Prima', icon: '🧮' },
      { id: 'pesaje', label: 'Pesaje', icon: '🏋️' },
    ],
  },
  {
    titulo: 'Ventas y Despacho',
    items: [
      { id: 'clientes', label: 'Clientes', icon: '👥' },
      { id: 'despachos', label: 'Despachos', icon: '🚚' },
      { id: 'salidas-almacen', label: 'Salidas de Almacén', icon: '📤' },
    ],
  },
  {
    titulo: 'Finanzas',
    items: [
      { id: 'centros-costo', label: 'Centros de Costo', icon: '💰' },
      { id: 'control-bancario', label: 'Control Bancario', icon: '🏦' },
    ],
  },
  {
    titulo: 'Comunicación',
    items: [{ id: 'correos-enviados', label: 'Correos Enviados', icon: '📧' }],
  },
  {
    titulo: 'Configuración',
    items: [
      { id: 'datos-empresa', label: 'Datos de Empresa', icon: '🏛️' },
      { id: 'personal-empresa', label: 'Personal de Empresa', icon: '🧑‍💼' },
      { id: 'usuarios', label: 'Usuarios', icon: '🔐' },
      { id: 'referencias', label: 'Referencias', icon: '⚙️' },
      { id: 'modulos-sistema', label: 'Módulos del Sistema', icon: '🗂️' },
    ],
  },
  {
    titulo: 'Herramientas',
    items: [
      { id: 'asistente', label: 'Agente', icon: '🤖' },
      { id: 'documentacion', label: 'Documentación', icon: '📚' },
    ],
  },
]

const NARANJA = '#ea580c'
const AZUL_OSCURO = '#0f2a4a'

export function EcosystemSidebar() {
  const pathname = usePathname()
  const user = useCurrentUserStore((s) => s.user)

  const iniciales = `${user?.nombre?.charAt(0) ?? ''}${user?.apellido?.charAt(0) ?? ''}` || 'U'

  return (
    <aside
      className="w-64 shrink-0 h-screen sticky top-0 flex flex-col overflow-hidden"
      style={{ background: AZUL_OSCURO, borderRight: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Encabezado / marca */}
      <div className="px-5 py-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black text-white shrink-0"
            style={{ background: NARANJA }}
          >
            GI
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">Gestión de Inventario</p>
            <p className="text-xs text-white/50 truncate">Sistema SPIN</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((grupo) => (
          <div key={grupo.titulo}>
            <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
              {grupo.titulo}
            </p>
            <div className="space-y-0.5">
              {grupo.items.map((item) => {
                const href = `/${item.id}`
                const activo = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
                    style={
                      activo
                        ? { background: 'rgba(234,88,12,0.2)', color: '#ffffff', fontWeight: 600, boxShadow: `inset 3px 0 0 ${NARANJA}` }
                        : { color: 'rgba(255,255,255,0.8)' }
                    }
                  >
                    <span className="text-base shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pie / usuario */}
      <div className="px-4 py-3 shrink-0 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: 'rgba(234,88,12,0.4)', border: `1px solid ${NARANJA}` }}
        >
          {iniciales.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user?.nombre} {user?.apellido}
          </p>
          <p className="text-xs text-white/50 truncate">{user?.rol}</p>
        </div>
      </div>
    </aside>
  )
}
