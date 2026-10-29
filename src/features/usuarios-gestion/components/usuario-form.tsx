'use client'

import { useState } from 'react'
import { type Usuario } from '@/features/usuarios-gestion/types'

type Props = {
  usuario?: Usuario
  onSubmit: (u: Usuario) => void
  onClose: () => void
}

const ROLES = ['Admin', 'Supervisor', 'Operador', 'Consulta']

const inputStyle: React.CSSProperties = {
  background: 'rgba(15,23,42,0.04)',
  border: '1px solid rgba(15,23,42,0.1)',
  color: '#1e293b',
}

const labelClass = 'block text-xs font-medium text-slate-500 mb-1.5'
const fieldClass = 'w-full px-3 py-2 rounded-lg text-sm outline-none focus:border-black/30 transition-colors'

export function UsuarioForm({ usuario, onSubmit, onClose }: Props) {
  const esEdicion = !!usuario?.id

  const [form, setForm] = useState({
    usuario: usuario?.usuario ?? '',
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    correo: usuario?.correo ?? '',
    clave: '',
    rol: usuario?.rol ?? 'Operador',
    situacion: usuario?.situacion ?? 'Activo',
  })
  const [errors, setErrors] = useState<{ usuario?: string; nombre?: string }>({})

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!form.usuario.trim()) errs.usuario = 'Requerido'
    if (!form.nombre.trim()) errs.nombre = 'Requerido'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const result: Usuario = {
      ...(usuario ?? {}),
      id: usuario?.id ?? '',
      usuario: form.usuario.trim(),
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      correo: form.correo.trim(),
      clave: form.clave,
      rol: form.rol,
      situacion: form.situacion,
    }
    onSubmit(result)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: 'rgba(23,23,23,0.98)', border: '1px solid rgba(15,23,42,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800">
            {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-black/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Usuario *</label>
            <input
              value={form.usuario}
              onChange={(e) => set('usuario', e.target.value)}
              className={fieldClass}
              style={inputStyle}
              placeholder="nombre.usuario"
            />
            {errors.usuario && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.usuario}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input
                value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)}
                className={fieldClass}
                style={inputStyle}
              />
              {errors.nombre && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.nombre}</p>}
            </div>
            <div>
              <label className={labelClass}>Apellido</label>
              <input
                value={form.apellido}
                onChange={(e) => set('apellido', e.target.value)}
                className={fieldClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Correo</label>
            <input
              type="email"
              value={form.correo}
              onChange={(e) => set('correo', e.target.value)}
              className={fieldClass}
              style={inputStyle}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className={labelClass}>Clave</label>
            <input
              type="password"
              value={form.clave}
              onChange={(e) => set('clave', e.target.value)}
              className={fieldClass}
              style={inputStyle}
              placeholder={esEdicion ? 'Dejar vacío para no cambiar' : ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Rol</label>
              <select
                value={form.rol}
                onChange={(e) => set('rol', e.target.value)}
                className={fieldClass}
                style={inputStyle}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} style={{ background: '#171717' }}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select
                value={form.situacion}
                onChange={(e) => set('situacion', e.target.value)}
                className={fieldClass}
                style={inputStyle}
              >
                <option value="Activo" style={{ background: '#171717' }}>Activo</option>
                <option value="Inactivo" style={{ background: '#171717' }}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 transition-colors hover:bg-black/5"
              style={{ border: '1px solid rgba(15,23,42,0.1)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-800 transition-all hover:opacity-90"
              style={{ background: '#ea580c', border: '1px solid #ea580c' }}
            >
              {esEdicion ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
