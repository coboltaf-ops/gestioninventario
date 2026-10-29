export type Permiso = {
  ver?: boolean
  crear?: boolean
  editar?: boolean
  eliminar?: boolean
}

export type Usuario = {
  id: string
  usuario?: string
  nombre?: string
  apellido?: string
  correo?: string
  clave?: string
  rol?: string
  situacion?: string
  permisos?: Record<string, Permiso>
  [key: string]: any
}

export const MODULOS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'productos', label: 'Productos' },
  { id: 'proveedores', label: 'Proveedores' },
  { id: 'bodegas', label: 'Bodegas' },
  { id: 'kardex', label: 'Kardex' },
  { id: 'ordenes-compra', label: 'Órdenes de Compra' },
  { id: 'recepcion-facturas', label: 'Recepción de Facturas' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'pagos-proveedores', label: 'Pagos a Proveedores' },
  { id: 'transferencias', label: 'Transferencias' },
  { id: 'salidas-almacen', label: 'Salidas de Almacén' },
  { id: 'ajustes-inventario', label: 'Ajustes de Inventario' },
  { id: 'despachos', label: 'Despachos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'formulas', label: 'Fórmulas' },
  { id: 'ordenes-produccion', label: 'Órdenes de Producción' },
  { id: 'centros-costo', label: 'Centros de Costo' },
  { id: 'control-bancario', label: 'Control Bancario' },
  { id: 'correos-enviados', label: 'Correos Enviados' },
  { id: 'datos-empresa', label: 'Datos de Empresa' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'referencias', label: 'Referencias' },
  { id: 'modulos-sistema', label: 'Módulos del Sistema' },
]

export const ESTADOS = [{ id: 1, nombre: "Activo" }, { id: 0, nombre: "Inactivo" }]
