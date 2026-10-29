'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProductosComidasStore, nextCodigoComida } from '@/features/inventario-comidas/store/productos-comidas-store'
import type { ProductoComida, TipoProductoComida } from '@/features/inventario-comidas/types'

export default function ProductosComidasPage() {
  const router = useRouter()
  const { productos, addProductoComida, updateProductoComida, deleteProductoComida } = useProductosComidasStore()
  const [tab, setTab] = useState<'platos' | 'mp'>('platos')
  const [editing, setEditing] = useState<ProductoComida | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<ProductoComida>>({
    tipo: 'Plato',
    situacion: 'Activo',
    disponible: true,
    existencia: 0,
    precio_unitario: 0,
  })

  const tipo = tab === 'platos' ? ('Plato' as TipoProductoComida) : ('Materia Prima Cocina' as TipoProductoComida)
  const filtered = productos.filter((p) => p.tipo === tipo)

  const handleSave = async () => {
    try {
      if (!formData.descripcion || !formData.categoria) {
        alert('Por favor completa todos los campos requeridos')
        return
      }

      let producto: ProductoComida
      if (editing) {
        producto = { ...editing, ...formData } as ProductoComida
        updateProductoComida(editing.id, producto)
      } else {
        const tipo = tab === 'platos' ? ('Plato' as TipoProductoComida) : ('Materia Prima Cocina' as TipoProductoComida)
        const codigo = nextCodigoComida(productos, tipo)
        producto = {
          id: crypto.randomUUID(),
          codigo,
          tipo,
          ...formData,
        } as ProductoComida
        addProductoComida(producto)
      }

      const allProductos = editing
        ? productos.map((p) => (p.id === editing.id ? producto : p))
        : [...productos, producto]

      await fetch('/api/data/productos-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allProductos),
      })

      setShowForm(false)
      setEditing(null)
      setFormData({ tipo: 'Plato', situacion: 'Activo', disponible: true, existencia: 0, precio_unitario: 0 })
    } catch (err) {
      alert('Error guardando producto: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleOpenForm = () => {
    setEditing(null)
    setFormData({ tipo: 'Plato', situacion: 'Activo', disponible: true, existencia: 0, precio_unitario: 0 })
    setShowForm(true)
  }

  const handleEditOpen = (producto: ProductoComida) => {
    setEditing(producto)
    setFormData(producto)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar producto?')) return
    try {
      deleteProductoComida(id)
      const updated = productos.filter((p) => p.id !== id)
      await fetch('/api/data/productos-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
    } catch (err) {
      alert('Error eliminando: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {tab === 'platos' ? '🍴 PLATOS DEL MENÚ' : '🥘 MATERIA PRIMA COCINA'}
          </h1>
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
            + AGREGAR
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
          <button
            onClick={() => setTab('platos')}
            style={{
              padding: '10px 20px',
              background: tab === 'platos' ? '#ea580c' : 'transparent',
              color: '#1e293b',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🍴 Platos
          </button>
          <button
            onClick={() => setTab('mp')}
            style={{
              padding: '10px 20px',
              background: tab === 'mp' ? '#3b82f6' : 'transparent',
              color: '#1e293b',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🥘 Materia Prima
          </button>
        </div>

        {/* Tabla */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No hay productos</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ea580c' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Código</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Descripción</th>
                  {tab === 'platos' && <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Categoría</th>}
                  {tab === 'platos' && <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Precio</th>}
                  {tab === 'mp' && <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Unidad</th>}
                  {tab === 'mp' && <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Stock</th>}
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((producto) => (
                  <tr key={producto.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{producto.codigo}</td>
                    <td style={{ padding: '12px' }}>{producto.descripcion}</td>
                    {tab === 'platos' && <td style={{ padding: '12px' }}>{producto.categoria}</td>}
                    {tab === 'platos' && <td style={{ padding: '12px' }}>${producto.precio_unitario.toLocaleString()}</td>}
                    {tab === 'mp' && <td style={{ padding: '12px' }}>{producto.unidad_medida}</td>}
                    {tab === 'mp' && <td style={{ padding: '12px' }}>{producto.existencia}</td>}
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: producto.situacion === 'Activo' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: producto.situacion === 'Activo' ? '#10b981' : '#ef4444',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}>
                        {producto.situacion}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEditOpen(producto)}
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
                        onClick={() => handleDelete(producto.id)}
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
          <div style={{
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
          }}>
            <div style={{
              background: '#111',
              padding: '40px',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              border: '2px solid #ea580c',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <h2 style={{ marginBottom: '20px', fontWeight: 'bold' }}>
                {editing ? '✎ Editar' : '➕ Nuevo'} Producto
              </h2>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Descripción *</label>
                <input
                  type="text"
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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

              {tab === 'platos' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Categoría *</label>
                    <input
                      type="text"
                      value={formData.categoria || ''}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
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
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Precio Unitario $</label>
                    <input
                      type="number"
                      value={formData.precio_unitario || 0}
                      onChange={(e) => setFormData({ ...formData, precio_unitario: parseFloat(e.target.value) || 0 })}
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

                  <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.disponible || false}
                      onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <label style={{ fontSize: '14px', color: '#aaa', cursor: 'pointer' }}>Disponible</label>
                  </div>
                </>
              )}

              {tab === 'mp' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Unidad de Medida</label>
                    <input
                      type="text"
                      value={formData.unidad_medida || ''}
                      onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                      placeholder="Kg, L, Unid, etc"
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
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Stock / Existencia</label>
                    <input
                      type="number"
                      value={formData.existencia || 0}
                      onChange={(e) => setFormData({ ...formData, existencia: parseFloat(e.target.value) || 0 })}
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
                </>
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
                    setFormData({ tipo: 'Plato', situacion: 'Activo', disponible: true, existencia: 0, precio_unitario: 0 })
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
