'use client'

import { type Usuario } from '@/features/usuarios-gestion/types'

type Props = {
  usuarios: Usuario[]
  esAdmin: boolean
  onNew: () => void
  onEdit: (u: Usuario) => void
  onDelete: (u: Usuario) => void
  onView: (u: Usuario) => void
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
}

function esActivo(situacion?: string) {
  if (!situacion) return false
  const s = situacion.toLowerCase()
  return s === 'activo' || s === '1' || s === 'true'
}

export function UsuariosTabla({ usuarios, esAdmin, onNew, onEdit, onDelete, onView }: Props) {
  const total = usuarios.length
  const activos = usuarios.filter((u) => esActivo(u.situacion)).length

  return (
    <div>
      {/* Header + stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <div className="px-5 py-3 rounded-xl" style={cardStyle}>
            <div className="text-xs text-white/50">Total Usuarios</div>
            <div className="text-2xl font-bold text-white">{total}</div>
          </div>
          <div className="px-5 py-3 rounded-xl" style={cardStyle}>
            <div className="text-xs text-white/50">Activos</div>
            <div className="text-2xl font-bold" style={{ color: 'rgba(59,130,246,1)' }}>{activos}</div>
          </div>
        </div>
        <button
          onClick={onNew}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: '#ea580c', border: '1px solid #ea580c' }}
        >
          ➕ Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Usuario</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Nombre</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Apellido</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Correo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Rol</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr className="border-t border-white/5">
                  <td colSpan={7} className="px-5 py-10 text-center text-white/40 text-sm">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-white">{u.usuario || '—'}</td>
                    <td className="px-5 py-4 text-sm text-white/80">{u.nombre || '—'}</td>
                    <td className="px-5 py-4 text-sm text-white/80">{u.apellido || '—'}</td>
                    <td className="px-5 py-4 text-sm text-white/80">{u.correo || '—'}</td>
                    <td className="px-5 py-4 text-sm">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium"
                        style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#fff' }}
                      >
                        {u.rol || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                        style={esActivo(u.situacion) ? {
                          background: 'rgba(22,163,74,0.4)',
                          border: '1px solid rgba(22,163,74,0.7)',
                          color: '#fff',
                        } : {
                          background: 'rgba(220,38,38,0.4)',
                          border: '1px solid rgba(239,68,68,0.7)',
                          color: '#fff',
                        }}
                      >
                        ● {u.situacion || 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onView(u)}
                          title="Ver"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          👁
                        </button>
                        {esAdmin && (
                          <>
                            <button
                              onClick={() => onEdit(u)}
                              title="Editar"
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => onDelete(u)}
                              title="Eliminar"
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
