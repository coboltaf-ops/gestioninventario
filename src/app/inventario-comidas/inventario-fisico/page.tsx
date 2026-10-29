'use client'

import { useState } from 'react'
import { useInventarioFisicoComidasStore, nextNumeroInventarioFisico } from '@/features/inventario-comidas/store/inventario-fisico-comidas-store'
import { useBodegasComidasStore } from '@/features/inventario-comidas/store/bodegas-comidas-store'
import type { InventarioFisicoComida } from '@/features/inventario-comidas/types'

export default function InventarioFisicoComidasPage() {
  const { inventarios, addInventarioFisico, updateInventarioFisico, deleteInventarioFisico } = useInventarioFisicoComidasStore()
  const { bodegas } = useBodegasComidasStore()
  const [editing, setEditing] = useState<InventarioFisicoComida | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<InventarioFisicoComida>>({
    tipo: 'Total',
    estado: 'Planeado',
    responsables: [],
    bodegas_incluidas: [],
    detalles_conteo: [],
  })

  const handleSave = async () => {
    try {
      if ((formData.bodegas_incluidas?.length || 0) === 0 || (formData.responsables?.length || 0) === 0) {
        alert('Por favor selecciona bodegas y responsables')
        return
      }

      let inventario: InventarioFisicoComida
      if (editing) {
        inventario = { ...editing, ...formData } as InventarioFisicoComida
        updateInventarioFisico(editing.id, inventario)
      } else {
        const numero = nextNumeroInventarioFisico(inventarios)
        inventario = {
          id: crypto.randomUUID(),
          numero,
          fecha_inicio: new Date().toISOString(),
          ...formData,
          discrepancias_encontradas: 0,
          porcentaje_diferencia: 0,
          productos_vencidos: 0,
          acciones_tomadas: [],
        } as InventarioFisicoComida
        addInventarioFisico(inventario)
      }

      const allInventarios = editing
        ? inventarios.map((i) => (i.id === editing.id ? inventario : i))
        : [...inventarios, inventario]

      await fetch('/api/data/inventario-fisico-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allInventarios),
      })

      setShowForm(false)
      setEditing(null)
      setFormData({
        tipo: 'Total',
        estado: 'Planeado',
        responsables: [],
        bodegas_incluidas: [],
        detalles_conteo: [],
      })
    } catch (err) {
      alert('Error guardando inventario: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar inventario físico?')) return
    try {
      deleteInventarioFisico(id)
      const updated = inventarios.filter((i) => i.id !== id)
      await fetch('/api/data/inventario-fisico-comidas', {
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
      tipo: 'Total',
      estado: 'Planeado',
      responsables: [],
      bodegas_incluidas: [],
      detalles_conteo: [],
    })
    setShowForm(true)
  }

  const handleEditOpen = (inventario: InventarioFisicoComida) => {
    setEditing(inventario)
    setFormData(inventario)
    setShowForm(true)
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>📋 INVENTARIO FÍSICO</h1>
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
            + NUEVO CONTEO
          </button>
        </div>

        {inventarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No hay inventarios físicos. Planifica conteos periódicos.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ea580c' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Número</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Fecha Inicio</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Bodegas</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Discrepancias</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventarios.map((inventario) => (
                  <tr key={inventario.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{inventario.numero}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>{inventario.tipo}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {new Date(inventario.fecha_inicio).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          background:
                            inventario.estado === 'Completado'
                              ? 'rgba(16,185,129,0.2)'
                              : inventario.estado === 'En_Proceso'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : 'rgba(156,163,175,0.2)',
                          color:
                            inventario.estado === 'Completado'
                              ? '#10b981'
                              : inventario.estado === 'En_Proceso'
                                ? '#3b82f6'
                                : '#9ca3af',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {inventario.estado}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {inventario.bodegas_incluidas?.length || 0}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: inventario.discrepancias_encontradas > 0 ? '#ef4444' : '#10b981' }}>
                        {inventario.discrepancias_encontradas}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEditOpen(inventario)}
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
                        onClick={() => handleDelete(inventario.id)}
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
                {editing ? '✎ Editar' : '➕ Nuevo'} Inventario Físico
              </h2>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Tipo</label>
                <select
                  value={formData.tipo || 'Total'}
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
                  <option value="Total">Total</option>
                  <option value="Parcial_Bodega">Parcial por Bodega</option>
                  <option value="Control_Perecederos">Control Perecederos</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Bodegas a Contar *
                </label>
                <div
                  style={{
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    padding: '10px',
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}
                >
                  {bodegas.map((b) => (
                    <div key={b.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={(formData.bodegas_incluidas || []).includes(b.id)}
                        onChange={(e) => {
                          const bodegasAct = formData.bodegas_incluidas || []
                          const nuevasList = e.target.checked ? [...bodegasAct, b.id] : bodegasAct.filter((x) => x !== b.id)
                          setFormData({ ...formData, bodegas_incluidas: nuevasList })
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <label style={{ fontSize: '14px', color: '#1e293b', cursor: 'pointer' }}>{b.nombre}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
                  Responsables *
                </label>
                <input
                  type="text"
                  value={(formData.responsables || []).join(', ')}
                  onChange={(e) => setFormData({ ...formData, responsables: e.target.value.split(',').map((s) => s.trim()) })}
                  placeholder="Nombres separados por comas"
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
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Estado</label>
                <select
                  value={formData.estado || 'Planeado'}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
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
                  <option value="Planeado">Planeado</option>
                  <option value="En_Proceso">En Proceso</option>
                  <option value="Completado">Completado</option>
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
                      tipo: 'Total',
                      estado: 'Planeado',
                      responsables: [],
                      bodegas_incluidas: [],
                      detalles_conteo: [],
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
