'use client'

import { useTipoInventarioSesion } from '../store/tipo-inventario-store'

// Muestra el tipo de inventario activo en la sesión y permite limpiarlo.
// Cadena vacía = sin filtro (todos los tipos).
export function TipoInventarioBadge() {
  const tipoActivo = useTipoInventarioSesion((s) => s.tipoActivo)
  const setTipoActivo = useTipoInventarioSesion((s) => s.setTipoActivo)

  if (!tipoActivo) return null

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
      style={{ background: 'rgba(234,88,12,0.15)', border: '1px solid rgba(234,88,12,0.5)', color: '#1e293b' }}
    >
      <span>📦 {tipoActivo}</span>
      <button
        onClick={() => setTipoActivo(null)}
        className="text-slate-600 hover:text-slate-800 transition-colors"
        title="Quitar filtro de tipo de inventario"
      >
        ✕
      </button>
    </div>
  )
}
