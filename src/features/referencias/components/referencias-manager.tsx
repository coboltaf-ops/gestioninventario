'use client'

import { useState } from 'react'
import { useReferenceStore, type ReferenceItem } from '../store/reference-store'

// Convierte snake_case a "Title Case" legible: tipo_inventario -> "Tipo Inventario".
function formatLabel(key: string): string {
  return key
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

interface FormState {
  id?: string
  descripcion: string
  situacion: boolean
}

const EMPTY_FORM: FormState = { descripcion: '', situacion: true }

export function ReferenciasManager() {
  const data = useReferenceStore((s) => s.data)
  const addItem = useReferenceStore((s) => s.addItem)
  const updateItem = useReferenceStore((s) => s.updateItem)
  const deleteItem = useReferenceStore((s) => s.deleteItem)

  const tablas = Object.keys(data)
  const [tablaActiva, setTablaActiva] = useState<string>(tablas[0] ?? '')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const items = data[tablaActiva] ?? []

  function openAdd() {
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(item: ReferenceItem) {
    setForm({
      id: item.id,
      descripcion: item.descripcion ?? '',
      situacion: Boolean(item.situacion),
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setForm(EMPTY_FORM)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!tablaActiva) return
    const payload = {
      descripcion: form.descripcion.trim(),
      situacion: form.situacion,
    }
    if (form.id) {
      updateItem(tablaActiva, form.id, payload)
    } else {
      addItem(tablaActiva, payload)
    }
    closeForm()
  }

  function handleDelete(item: ReferenceItem) {
    if (!item.id) return
    if (confirm(`¿Eliminar "${item.descripcion ?? item.id}"?`)) {
      deleteItem(tablaActiva, item.id)
    }
  }

  return (
    <div className="flex gap-4 text-white">
      {/* Menú lateral de tablas */}
      <aside
        className="w-64 shrink-0 rounded-xl border p-2"
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <h2 className="px-3 py-2 text-sm font-semibold text-white/50">
          Tablas de referencia
        </h2>
        <ul className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
          {tablas.map((t) => {
            const activa = t === tablaActiva
            return (
              <li key={t}>
                <button
                  onClick={() => {
                    setTablaActiva(t)
                    closeForm()
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors"
                  style={{
                    background: activa
                      ? 'rgba(59,130,246,1)'
                      : 'transparent',
                    color: activa ? '#ffffff' : 'rgba(255,255,255,0.8)',
                  }}
                >
                  <span className="truncate">{formatLabel(t)}</span>
                  <span className="ml-2 text-xs text-white/50">
                    {(data[t] ?? []).length}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* Panel de la tabla activa */}
      <section
        className="flex-1 rounded-xl border p-4"
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {tablaActiva ? formatLabel(tablaActiva) : 'Referencias'}
          </h1>
          <button
            onClick={openAdd}
            disabled={!tablaActiva}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: '#ea580c' }}
          >
            ➕ Agregar
          </button>
        </div>

        {/* Formulario inline de alta/edición */}
        {showForm && (
          <form
            onSubmit={handleSave}
            className="mb-4 rounded-lg border p-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-1 flex-col gap-1 text-sm">
                <span className="text-white/50">Descripción</span>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descripcion: e.target.value }))
                  }
                  required
                  autoFocus
                  className="rounded-lg border bg-transparent px-3 py-2 text-white outline-none focus:border-white/30"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-white/50">Estado</span>
                <select
                  value={form.situacion ? 'activo' : 'inactivo'}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      situacion: e.target.value === 'activo',
                    }))
                  }
                  className="rounded-lg border bg-transparent px-3 py-2 text-white outline-none focus:border-white/30"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <option value="activo" className="bg-neutral-900">
                    Activo
                  </option>
                  <option value="inactivo" className="bg-neutral-900">
                    Inactivo
                  </option>
                </select>
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: '#ea580c' }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Listado de items */}
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center text-white/50"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            Sin registros
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-white/50">
                  <th className="border-b px-3 py-2 font-medium"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    Descripción
                  </th>
                  <th className="border-b px-3 py-2 font-medium"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    Estado
                  </th>
                  <th className="border-b px-3 py-2 text-right font-medium"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5">
                    <td className="border-b px-3 py-2"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      {item.descripcion || <span className="text-white/40">—</span>}
                    </td>
                    <td className="border-b px-3 py-2"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <span
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{
                          background: item.situacion
                            ? 'rgba(34,197,94,0.15)'
                            : 'rgba(255,255,255,0.08)',
                          color: item.situacion
                            ? 'rgb(74,222,128)'
                            : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        {item.situacion ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="border-b px-3 py-2 text-right"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <button
                        onClick={() => openEdit(item)}
                        className="mr-2 rounded px-2 py-1 transition-colors hover:bg-white/10"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded px-2 py-1 transition-colors hover:bg-white/10"
                        title="Eliminar"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
