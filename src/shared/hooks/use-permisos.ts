'use client'

// Hook de permisos por módulo. Actualmente permisivo (todo habilitado);
// se incluyen todas las propiedades que consumen las páginas para evitar
// que queden funciones/botones ocultos por valores undefined.
export function usePermisos(modulo?: string) {
  return {
    crear: true,
    leer: true,
    editar: true,
    actualizar: true,
    registrar: true,
    eliminar: true,
    esAdmin: true,
  }
}
