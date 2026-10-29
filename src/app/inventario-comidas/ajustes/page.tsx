'use client'

import { useState } from 'react'
import { useAjustesInventarioComidasStore, nextNumeroAjuste } from '@/features/inventario-comidas/store/ajustes-inventario-comidas-store'
import { useBodegasComidasStore } from '@/features/inventario-comidas/store/bodegas-comidas-store'
import type { AjusteInventarioComida } from '@/features/inventario-comidas/types'

export default function AjustesComidasPage() {
  const { ajustes, addAjuste, updateAjuste, deleteAjuste } = useAjustesInventarioComidasStore()
  const { bodegas } = useBodegasComidasStore()
  const [editing, setEditing] = useState<AjusteInventarioComida | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<AjusteInventarioComida>>({
    tipo_ajuste: 'Faltante',
    detalles: [],
  })

  const handleSave = async () => {
    try {
      if (!formData.bodega_id || !formData.tipo_ajuste) {
        alert('Por favor completa bodega y tipo')
        return
      }

      let ajuste: AjusteInventarioComida
      if (editing) {
        ajuste = { ...editing, ...formData } as AjusteInventarioComida
        updateAjuste(editing.id, ajuste)
      } else {
        const numero = nextNumeroAjuste(ajustes)
        ajuste = {
          id: crypto.randomUUID(),
          numero,
          fecha: new Date().toISOString(),
          ...formData,
        } as AjusteInventarioComida
        addAjuste(ajuste)
      }

      const allAjustes = editing ? ajustes.map((a) => (a.id === editing.id ? ajuste : a)) : [...ajustes, ajuste]

      await fetch('/api/data/ajustes-inventario-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allAjustes),
      })

      setShowForm(false)
      setEditing(null)
      setFormData({ tipo_ajuste: 'Faltante', detalles: [] })
    } catch (err) {
      alert('Error guardando ajuste: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar ajuste?')) return
    try {
      deleteAjuste(id)
      const updated = ajustes.filter((a) => a.id !== id)
      await fetch('/api/data/ajustes-inventario-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
    } catch (err) {
      alert('Error eliminando: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleOpenForm = () => {
    setEditing(null)
    setFormData({ tipo_ajuste: 'Faltante', detalles: [] })
    setShowForm(true)
  }

  const handleEditOpen = (ajuste: AjusteInventarioComida) => {
    setEditing(ajuste)
    setFormData(ajuste)
    setShowForm(true)
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>🔧 AJUSTES DE INVENTARIO</h1>
          <button
            onClick={handleOpenForm}
            style={{
              padding: '12px 24px',
              background: '#ea580c',
              color: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            + NUEVO AJUSTE
          </button>
        </div>

        {ajustes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No hay ajustes. Registra correcciones de inventario.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ea580c' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Número</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Bodega</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Items</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Detectado Por</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ajustes.map((ajuste) => {
                  const bodega = bodegas.find((b) => b.id === ajuste.bodega_id)
                  return (
                    <tr key={ajuste.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{ajuste.numero}</td>
                      <td style={{ padding: '12px', fontSize: '12px' }}>
                        {new Date(ajuste.fecha).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>{bodega?.nombre || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '12px' }}>{ajuste.tipo_ajuste}</td>
                      <td style={{ padding: '12px' }}>{ajuste.detalles?.length || 0}</td>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#aaa' }}>{ajuste.detectado_por}</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleEditOpen(ajuste)}
                          style={{
                            padding: '4px 8px',
                            background: '#ea580c',
                            color: '#1e293b',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            marginRight: '5px',
                          }}
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(ajuste.id)}
                          style={{
                            padding: '4px 8px',
                            background: '#ef4444',
                            color: '#1e293b',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: '#111',
                padding: '40px',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '90%',
                border: '2px solid #ea580c',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <h2 style={{ marginBottom: '20px', fontWeight: 'bold' }}>
                {editing ? '✎ Editar' : '➕ Nuevo'} Ajuste
              </h2>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Bodega *
                </label>
                <select
                  value={formData.bodega_id || ''}
                  onChange={(e) => setFormData({ ...formData, bodega_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">-- Selecciona bodega --</option>
                  {bodegas.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Tipo Ajuste *
                </label>
                <select
                  value={formData.tipo_ajuste || 'Faltante'}
                  onChange={(e) => setFormData({ ...formData, tipo_ajuste: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Sobrante">Sobrante</option>
                  <option value="Faltante">Faltante</option>
                  <option value="Vencimiento">Vencimiento</option>
                  <option value="Merma">Merma</option>
                  <option value="Pérdida">Pérdida</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Detectado Por
                </label>
                <input
                  type="text"
                  value={formData.detectado_por || ''}
                  onChange={(e) => setFormData({ ...formData, detectado_por: e.target.value })}
                  placeholder="Nombre de usuario o bodeguero"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Causa Raíz
                </label>
                <input
                  type="text"
                  value={formData.causa_raiz || ''}
                  onChange={(e) => setFormData({ ...formData, causa_raiz: e.target.value })}
                  placeholder="¿Qué causó el ajuste?"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#10b981',
                    color: '#1e293b',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {editing ? 'ACTUALIZAR' : 'GUARDAR'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                    setFormData({ tipo_ajuste: 'Faltante', detalles: [] })
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#666',
                    color: '#1e293b',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
