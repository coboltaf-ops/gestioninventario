'use client'

import { useState } from 'react'
import { useProveedoresComidasStore, nextCodigoProveedor } from '@/features/inventario-comidas/store/proveedores-comidas-store'
import type { ProveedorComida } from '@/features/inventario-comidas/types'

export default function ProveedoresComidasPage() {
  const { proveedores, addProveedorComida, updateProveedorComida, deleteProveedorComida } = useProveedoresComidasStore()
  const [editing, setEditing] = useState<ProveedorComida | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<ProveedorComida>>({
    situacion: 'Activo',
    tipos_alimentos: [],
    dias_entrega: [],
    requiere_orden_minima: false,
  })

  const handleSave = async () => {
    try {
      if (!formData.nombre || !formData.contacto || !formData.email) {
        alert('Por favor completa los campos requeridos')
        return
      }

      let proveedor: ProveedorComida
      if (editing) {
        proveedor = { ...editing, ...formData } as ProveedorComida
        updateProveedorComida(editing.id, proveedor)
      } else {
        const codigo = nextCodigoProveedor(proveedores)
        proveedor = {
          id: crypto.randomUUID(),
          codigo,
          ...formData,
        } as ProveedorComida
        addProveedorComida(proveedor)
      }

      const allProveedores = editing
        ? proveedores.map((p) => (p.id === editing.id ? proveedor : p))
        : [...proveedores, proveedor]

      await fetch('/api/data/proveedores-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allProveedores),
      })

      setShowForm(false)
      setEditing(null)
      setFormData({ situacion: 'Activo', tipos_alimentos: [], dias_entrega: [], requiere_orden_minima: false })
    } catch (err) {
      alert('Error guardando proveedor: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar proveedor?')) return
    try {
      deleteProveedorComida(id)
      const updated = proveedores.filter((p) => p.id !== id)
      await fetch('/api/data/proveedores-comidas', {
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
    setFormData({ situacion: 'Activo', tipos_alimentos: [], dias_entrega: [], requiere_orden_minima: false })
    setShowForm(true)
  }

  const handleEditOpen = (proveedor: ProveedorComida) => {
    setEditing(proveedor)
    setFormData(proveedor)
    setShowForm(true)
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>🏢 PROVEEDORES</h1>
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
            + AGREGAR PROVEEDOR
          </button>
        </div>

        {/* Tabla */}
        {proveedores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No hay proveedores. Agrega uno para comenzar a hacer compras.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ea580c' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Código</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Contacto</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Teléfono</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Entrega (días)</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((proveedor) => (
                  <tr key={proveedor.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{proveedor.codigo}</td>
                    <td style={{ padding: '12px' }}>{proveedor.nombre}</td>
                    <td style={{ padding: '12px' }}>{proveedor.contacto}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#aaa' }}>{proveedor.email}</td>
                    <td style={{ padding: '12px' }}>{proveedor.telefono}</td>
                    <td style={{ padding: '12px' }}>{proveedor.tiempo_entrega_dias} días</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          background: proveedor.situacion === 'Activo' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                          color: proveedor.situacion === 'Activo' ? '#10b981' : '#ef4444',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {proveedor.situacion}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEditOpen(proveedor)}
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
                        onClick={() => handleDelete(proveedor.id)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Modal */}
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
                {editing ? '✎ Editar' : '➕ Nuevo'} Proveedor
              </h2>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                    Contacto *
                  </label>
                  <input
                    type="text"
                    value={formData.contacto || ''}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
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
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
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
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                    Tiempo Entrega (días)
                  </label>
                  <input
                    type="number"
                    value={formData.tiempo_entrega_dias || 1}
                    onChange={(e) => setFormData({ ...formData, tiempo_entrega_dias: parseInt(e.target.value) || 1 })}
                    min="1"
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
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
                  Estado
                </label>
                <select
                  value={formData.situacion || 'Activo'}
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
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
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
                    setFormData({ situacion: 'Activo', tipos_alimentos: [], dias_entrega: [], requiere_orden_minima: false })
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
