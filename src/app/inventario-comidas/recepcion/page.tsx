'use client'

import { useState } from 'react'
import { useRecepcionesComidasStore, nextNumeroRecepcion } from '@/features/inventario-comidas/store/recepcion-facturas-comidas-store'
import { useProveedoresComidasStore } from '@/features/inventario-comidas/store/proveedores-comidas-store'
import { useOrdenesComidasStore } from '@/features/inventario-comidas/store/ordenes-compra-comidas-store'
import type { RecepcionFacturaComida } from '@/features/inventario-comidas/types'

export default function RecepcionComidasPage() {
  const { recepciones, addRecepcionComida, updateRecepcionComida, deleteRecepcionComida } = useRecepcionesComidasStore()
  const { proveedores } = useProveedoresComidasStore()
  const { ordenes } = useOrdenesComidasStore()
  const [editing, setEditing] = useState<RecepcionFacturaComida | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<RecepcionFacturaComida>>({
    inspeccion_realizada: false,
    aplica_trazabilidad: true,
    detalles: [],
  })

  const handleSave = async () => {
    try {
      if (!formData.proveedor_id || !formData.orden_compra_id) {
        alert('Por favor selecciona proveedor y orden')
        return
      }

      let recepcion: RecepcionFacturaComida
      if (editing) {
        recepcion = { ...editing, ...formData } as RecepcionFacturaComida
        updateRecepcionComida(editing.id, recepcion)
      } else {
        const numero = nextNumeroRecepcion(recepciones)
        recepcion = {
          id: crypto.randomUUID(),
          numero,
          fecha: new Date().toISOString(),
          ...formData,
          total_aceptado: (formData.detalles || [])
            .filter((d) => d.condicion === 'Aceptado')
            .reduce((sum, d) => sum + d.cantidad_recibida, 0),
          total_rechazado: (formData.detalles || [])
            .filter((d) => d.condicion === 'Rechazado')
            .reduce((sum, d) => sum + d.cantidad_recibida, 0),
        } as RecepcionFacturaComida
        addRecepcionComida(recepcion)
      }

      const allRecepciones = editing
        ? recepciones.map((r) => (r.id === editing.id ? recepcion : r))
        : [...recepciones, recepcion]

      await fetch('/api/data/recepcion-facturas-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allRecepciones),
      })

      setShowForm(false)
      setEditing(null)
      setFormData({ inspeccion_realizada: false, aplica_trazabilidad: true, detalles: [] })
    } catch (err) {
      alert('Error guardando recepción: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar recepción?')) return
    try {
      deleteRecepcionComida(id)
      const updated = recepciones.filter((r) => r.id !== id)
      await fetch('/api/data/recepcion-facturas-comidas', {
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
    setFormData({ inspeccion_realizada: false, aplica_trazabilidad: true, detalles: [] })
    setShowForm(true)
  }

  const handleEditOpen = (recepcion: RecepcionFacturaComida) => {
    setEditing(recepcion)
    setFormData(recepcion)
    setShowForm(true)
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>📨 RECEPCIÓN DE FACTURAS</h1>
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
            + NUEVA RECEPCIÓN
          </button>
        </div>

        {recepciones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No hay recepciones. Registra las facturas recibidas de proveedores.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ea580c' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Número</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Proveedor</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Aceptado</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Rechazado</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Trazabilidad</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recepciones.map((recepcion) => {
                  const prov = proveedores.find((p) => p.id === recepcion.proveedor_id)
                  return (
                    <tr key={recepcion.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{recepcion.numero}</td>
                      <td style={{ padding: '12px' }}>{prov?.nombre || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '12px' }}>
                        {new Date(recepcion.fecha).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', color: '#10b981' }}>
                        ✓ {recepcion.total_aceptado}
                      </td>
                      <td style={{ padding: '12px', color: '#ef4444' }}>
                        ✗ {recepcion.total_rechazado}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            background: recepcion.aplica_trazabilidad ? 'rgba(59, 130, 246, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                            color: recepcion.aplica_trazabilidad ? '#3b82f6' : '#9ca3af',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                        >
                          {recepcion.aplica_trazabilidad ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleEditOpen(recepcion)}
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
                          onClick={() => handleDelete(recepcion.id)}
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
                {editing ? '✎ Editar' : '➕ Nueva'} Recepción de Factura
              </h2>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Proveedor *
                </label>
                <select
                  value={formData.proveedor_id || ''}
                  onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
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
                  <option value="">-- Selecciona proveedor --</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Orden de Compra *
                </label>
                <select
                  value={formData.orden_compra_id || ''}
                  onChange={(e) => setFormData({ ...formData, orden_compra_id: e.target.value })}
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
                  <option value="">-- Selecciona orden --</option>
                  {ordenes.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.numero}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.inspeccion_realizada || false}
                  onChange={(e) => setFormData({ ...formData, inspeccion_realizada: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label style={{ fontSize: '14px', color: '#aaa', cursor: 'pointer' }}>
                  ¿Inspección realizada?
                </label>
              </div>

              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.aplica_trazabilidad || false}
                  onChange={(e) => setFormData({ ...formData, aplica_trazabilidad: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label style={{ fontSize: '14px', color: '#aaa', cursor: 'pointer' }}>
                  ¿Aplica trazabilidad?
                </label>
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
                    setFormData({ inspeccion_realizada: false, aplica_trazabilidad: true, detalles: [] })
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
