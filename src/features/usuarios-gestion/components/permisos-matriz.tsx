'use client'

import { useState } from 'react'
import { MODULOS, type Usuario, type Permiso } from '@/features/usuarios-gestion/types'

type Props = {
  usuarios: Usuario[]
  onUpdateUsuario: (id: string, cambios: Partial<Usuario>) => void
}

const ACCIONES: { key: keyof Permiso; label: string }[] = [
  { key: 'ver', label: 'Ver' },
  { key: 'crear', label: 'Crear' },
  { key: 'editar', label: 'Editar' },
  { key: 'eliminar', label: 'Eliminar' },
]

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
}

export function PermisosMatriz({ usuarios, onUpdateUsuario }: Props) {
  const [selectedId, setSelectedId] = useState<string>(usuarios[0]?.id ?? '')

  const usuario = usuarios.find((u) => u.id === selectedId)

  const getPermiso = (moduloId: string, accion: keyof Permiso): boolean => {
    return !!usuario?.permisos?.[moduloId]?.[accion]
  }

  const aplicar = (nuevosPermisos: Record<string, Permiso>) => {
    if (!usuario) return
    onUpdateUsuario(usuario.id, { permisos: nuevosPermisos })
  }

  const toggle = (moduloId: string, accion: keyof Permiso) => {
    if (!usuario) return
    const base = usuario.permisos ?? {}
    const moduloPerm = base[moduloId] ?? {}
    aplicar({
      ...base,
      [moduloId]: { ...moduloPerm, [accion]: !moduloPerm[accion] },
    })
  }

  const toggleFila = (moduloId: string, valor: boolean) => {
    if (!usuario) return
    const base = usuario.permisos ?? {}
    aplicar({
      ...base,
      [moduloId]: { ver: valor, crear: valor, editar: valor, eliminar: valor },
    })
  }

  const toggleTodo = (valor: boolean) => {
    if (!usuario) return
    const nuevos: Record<string, Permiso> = {}
    for (const m of MODULOS) {
      nuevos[m.id] = { ver: valor, crear: valor, editar: valor, eliminar: valor }
    }
    aplicar(nuevos)
  }

  const filaCompleta = (moduloId: string) =>
    ACCIONES.every((a) => getPermiso(moduloId, a.key))

  if (usuarios.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center text-white/40 text-sm" style={cardStyle}>
        No hay usuarios para gestionar permisos.
      </div>
    )
  }

  return (
    <div>
      {/* User selector + bulk actions */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Usuario</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none focus:border-white/30 transition-colors min-w-[220px]"
            style={cardStyle}
          >
            {usuarios.map((u) => (
              <option key={u.id} value={u.id} style={{ background: '#171717' }}>
                {u.usuario || u.nombre || u.id} {u.rol ? `· ${u.rol}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toggleTodo(true)}
            className="px-3 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'rgba(59,130,246,1)', border: '1px solid rgba(37,99,235,1)' }}
          >
            Marcar todo
          </button>
          <button
            onClick={() => toggleTodo(false)}
            className="px-3 py-2 rounded-lg text-xs font-medium text-white/70 transition-colors hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Desmarcar todo
          </button>
        </div>
      </div>

      {/* Matrix */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: 'rgba(30,30,30,1)' }}>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Módulo</th>
                {ACCIONES.map((a) => (
                  <th key={a.key} className="px-4 py-3 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">
                    {a.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">Todo</th>
              </tr>
            </thead>
            <tbody>
              {MODULOS.map((m) => (
                <tr key={m.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-white">{m.label}</td>
                  {ACCIONES.map((a) => (
                    <td key={a.key} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={getPermiso(m.id, a.key)}
                        onChange={() => toggle(m.id, a.key)}
                        className="w-4 h-4 cursor-pointer accent-[#ea580c]"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={filaCompleta(m.id)}
                      onChange={(e) => toggleFila(m.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer accent-[rgba(59,130,246,1)]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-white/30">
        Los cambios se guardan automáticamente para el usuario seleccionado.
      </p>
    </div>
  )
}
