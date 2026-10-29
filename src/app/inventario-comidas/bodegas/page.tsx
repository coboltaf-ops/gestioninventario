'use client'

import { useState } from 'react'
import { useBodegasComidasStore, nextCodigoBodega } from '@/features/inventario-comidas/store/bodegas-comidas-store'
import type { BodegaComida } from '@/features/inventario-comidas/types'

export default function BodegasComidasPage() {
  const { bodegas, addBodegaComida, updateBodegaComida, deleteBodegaComida } = useBodegasComidasStore()
  const [editing, setEditing] = useState<BodegaComida | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<BodegaComida>>({
    tipo: 'Despensa',
    temperatura_controlada: false,
    humedad_controlada: false,
    requiere_monitoreo: false,
    requiere_inventario_frecuente: true,
    dias_inventario: 7,
    situacion: 'Activo',
  })

  const handleSave = async () => {
    try {
      if (!formData.nombre) {
        alert('Por favor completa el nombre')
        return
      }

      let bodega: BodegaComida
      if (editing) {
        bodega = { ...editing, ...formData } as BodegaComida
        updateBodegaComida(editing.id, bodega)
      } else {
        const codigo = nextCodigoBodega(bodegas)
        bodega = {
          id: crypto.randomUUID(),
          codigo,
          ...formData,
        } as BodegaComida
        addBodegaComida(bodega)
      }

      const allBodegas = editing ? bodegas.map((b) => (b.id === editing.id ? bodega : b)) : [...bodegas, bodega]

      await fetch('/api/data/bodegas-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allBodegas),
      })

      setShowForm(false)
      setEditing(null)
      setFormData({
        tipo: 'Despensa',
        temperatura_controlada: false,
        humedad_controlada: false,
        requiere_monitoreo: false,
        requiere_inventario_frecuente: true,
        dias_inventario: 7,
        situacion: 'Activo',
      })
    } catch (err) {
      alert('Error guardando bodega: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar bodega?')) return
    try {
      deleteBodegaComida(id)
      const updated = bodegas.filter((b) => b.id !== id)
      await fetch('/api/data/bodegas-comidas', {
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
    setFormData({
      tipo: 'Despensa',
      temperatura_controlada: false,
      humedad_controlada: false,
      requiere_monitoreo: false,
      requiere_inventario_frecuente: true,
      dias_inventario: 7,
      situacion: 'Activo',
    })
    setShowForm(true)
  }

  const handleEditOpen = (bodega: BodegaComida) => {
    setEditing(bodega)
    setFormData(bodega)
    setShowForm(true)
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>🏭 BODEGAS</h1>
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
            + NUEVA BODEGA
          </button>
        </div>

        {bodegas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No hay bodegas. Crea espacios para almacenar ingredientes.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ea580c' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Código</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Temperatura</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Inv. Frecuente</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bodegas.map((bodega) => (
                  <tr key={bodega.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{bodega.codigo}</td>
                    <td style={{ padding: '12px' }}>{bodega.nombre}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>{bodega.tipo}</td>
                    <td style={{ padding: '12px' }}>
                      {bodega.temperatura_controlada ? `${bodega.temperatura_objetivo}°C` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {bodega.requiere_inventario_frecuente ? `c/${bodega.dias_inventario}d` : 'No'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          background: bodega.situacion === 'Activo' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                          color: bodega.situacion === 'Activo' ? '#10b981' : '#ef4444',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {bodega.situacion}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEditOpen(bodega)}
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
                        onClick={() => handleDelete(bodega.id)}
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
                {editing ? '✎ Editar' : '➕ Nueva'} Bodega
              </h2>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Nevera 1, Despensa Principal"
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
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Tipo</label>
                <select
                  value={formData.tipo || 'Despensa'}
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
                  <option value="Despensa">Despensa</option>
                  <option value="Nevera">Nevera</option>
                  <option value="Congelador">Congelador</option>
                  <option value="Almacen_Seco">Almacén Seco</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.temperatura_controlada || false}
                  onChange={(e) => setFormData({ ...formData, temperatura_controlada: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label style={{ fontSize: '14px', color: '#aaa', cursor: 'pointer' }}>¿Temperatura controlada?</label>
              </div>

              {formData.temperatura_controlada && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                    Temperatura Objetivo (°C)
                  </label>
                  <input
                    type="number"
                    value={formData.temperatura_objetivo || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, temperatura_objetivo: parseInt(e.target.value) || 0 })
                    }
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
              )}

              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.requiere_inventario_frecuente || false}
                  onChange={(e) => setFormData({ ...formData, requiere_inventario_frecuente: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label style={{ fontSize: '14px', color: '#aaa', cursor: 'pointer' }}>
                  ¿Requiere inventario frecuente?
                </label>
              </div>

              {formData.requiere_inventario_frecuente && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                    Cada cuántos días
                  </label>
                  <input
                    type="number"
                    value={formData.dias_inventario || 7}
                    onChange={(e) => setFormData({ ...formData, dias_inventario: parseInt(e.target.value) || 7 })}
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
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Estado</label>
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
                    setFormData({
                      tipo: 'Despensa',
                      temperatura_controlada: false,
                      humedad_controlada: false,
                      requiere_monitoreo: false,
                      requiere_inventario_frecuente: true,
                      dias_inventario: 7,
                      situacion: 'Activo',
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
