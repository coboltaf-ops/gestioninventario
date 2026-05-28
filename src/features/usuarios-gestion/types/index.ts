export type Usuario = {
  id: string
  nombre: string
  rol: string
}

export const MODULOS = [
  { id: 'dashboard', nombre: 'Dashboard' },
  { id: 'proveedores', nombre: 'Proveedores' },
  { id: 'productos', nombre: 'Productos' },
]

export const ESTADOS = [{ id: 1, nombre: "Activo" }, { id: 0, nombre: "Inactivo" }]
