'use client'

import { useState } from 'react'
import { useOrdenesComidasStore, nextNumeroOC } from '@/features/inventario-comidas/store/ordenes-compra-comidas-store'
import { useProveedoresComidasStore } from '@/features/inventario-comidas/store/proveedores-comidas-store'
import type { OrdenComida } from '@/features/inventario-comidas/types'

export default function OrdenesComidasPage() {
  const { ordenes, addOrdenComida, updateOrdenComida, deleteOrdenComida } = useOrdenesComidasStore()
  const { proveedores } = useProveedoresComidasStore()
  const [editing, setEditing] = useState<OrdenComida | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<OrdenComida>>({
    situacion: 'Borrador',
    tipo: 'Semanal',
    frecuencia_esperada: 'Semanal',
    es_urgente: false,
    detalles: [],
  })

  const handleSave = async () => {
    try {
      if (!formData.proveedor_id) {
        alert('Por favor selecciona un proveedor')
        return
      }

      const proveedor = proveedores.find((p) => p.id === formData.proveedor_id)
      if (!proveedor) {
        alert('Proveedor no encontrado')
        return
      }

      let orden: OrdenComida
      if (editing) {
        orden = { ...editing, ...formData } as OrdenComida
        updateOrdenComida(editing.id, orden)
      } else {
        const numero = nextNumeroOC(ordenes)
        const total = (formData.detalles || []).reduce((sum, d) => sum + (d.subtotal || 0), 0)
        orden = {
          id: crypto.randomUUID(),
          numero,
          fecha: new Date().toISOString(),
          ...formData,
          total,
          fecha_entrega_esperada: new Date(Date.now() + (proveedor.tiempo_entrega_dias || 3) * 24 * 60 * 60 * 1000).toISOString(),
          creado_por: 'usuario',
        } as OrdenComida
        addOrdenComida(orden)
      }

      const allOrdenes = editing ? ordenes.map((o) => (o.id === editing.id ? orden : o)) : [...ordenes, orden]

      await fetch('/api/data/ordenes-compra-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allOrdenes),
      })

      setShowForm(false)
      setEditing(null)
      setFormData({ situacion: 'Borrador', tipo: 'Semanal', frecuencia_esperada: 'Semanal', es_urgente: false, detalles: [] })
    } catch (err) {
      alert('Error guardando orden: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar orden?')) return
    try {
      deleteOrdenComida(id)
      const updated = ordenes.filter((o) => o.id !== id)
      await fetch('/api/data/ordenes-compra-comidas', {
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
    setFormData({ situacion: 'Borrador', tipo: 'Semanal', frecuencia_esperada: 'Semanal', es_urgente: false, detalles: [] })
    setShowForm(true)
  }

  const handleEditOpen = (orden: OrdenComida) => {
    setEditing(orden)
    setFormData(orden)
    setShowForm(true)
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>📦 ÓRDENES DE COMPRA</h1>
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
            + NUEVA ORDEN
          </button>
        </div>

        {ordenes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No hay órdenes de compra. Crea una para solicitar ingredientes a proveedores.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ea580c' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Número</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Proveedor</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Total</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => {
                  const prov = proveedores.find((p) => p.id === orden.proveedor_id)
                  return (
                    <tr key={orden.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{orden.numero}</td>
                      <td style={{ padding: '12px' }}>{prov?.nombre || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '12px' }}>
                        {new Date(orden.fecha).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>${orden.total.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            background:
                              orden.situacion === 'Confirmada'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : orden.situacion === 'Entregada'
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : 'rgba(156, 163, 175, 0.2)',
                            color:
                              orden.situacion === 'Confirmada'
                                ? '#3b82f6'
                                : orden.situacion === 'Entregada'
                                  ? '#10b981'
                                  : '#9ca3af',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                        >
                          {orden.situacion}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleEditOpen(orden)}
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
                          onClick={() => handleDelete(orden.id)}
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
                {editing ? '✎ Editar' : '➕ Nueva'} Orden de Compra
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
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Tipo</label>
                <select
                  value={formData.tipo || 'Semanal'}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
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
                  <option value="Semanal">Semanal</option>
                  <option value="Quincenal">Quincenal</option>
                  <option value="Mensual">Mensual</option>
                  <option value="Extraordinaria">Extraordinaria</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.es_urgente || false}
                  onChange={(e) => setFormData({ ...formData, es_urgente: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label style={{ fontSize: '14px', color: '#aaa', cursor: 'pointer' }}>¿Es urgente?</label>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Situación
                </label>
                <select
                  value={formData.situacion || 'Borrador'}
                  onChange={(e) => setFormData({ ...formData, situacion: e.target.value as any })}
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
                  <option value="Borrador">Borrador</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Entregada">Entregada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
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
                    setFormData({
                      situacion: 'Borrador',
                      tipo: 'Semanal',
                      frecuencia_esperada: 'Semanal',
                      es_urgente: false,
                      detalles: [],
                    })
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
