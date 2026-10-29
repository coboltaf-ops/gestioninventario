'use client'

import { useState } from 'react'
import { useUsuariosComidasStore } from '@/features/inventario-comidas/store/usuarios-comidas-store'
import type { UsuarioComida, RolComida } from '@/features/inventario-comidas/types'

const ROLES: { value: RolComida; label: string }[] = [
  { value: 'Admin', label: '👨‍💼 Administrador' },
  { value: 'Gerente', label: '📋 Gerente Comidas' },
  { value: 'Comprador', label: '🛒 Comprador' },
  { value: 'Bodeguero', label: '📦 Bodeguero' },
  { value: 'Chef', label: '👨‍🍳 Chef/Cocina' },
  { value: 'Caja', label: '💰 Caja/Ventas' },
  { value: 'Viewer', label: '👁️ Viewer (Solo Lectura)' },
]

export default function UsuariosComidasPage() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario } = useUsuariosComidasStore()
  const [editing, setEditing] = useState<UsuarioComida | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<UsuarioComida>>({
    situacion: 'Activo',
  })

  const handleSave = async () => {
    try {
      if (!formData.nombre || !formData.email || !formData.rol) {
        alert('Por favor completa nombre, email y rol')
        return
      }

      let usuario: UsuarioComida
      if (editing) {
        usuario = { ...editing, ...formData } as UsuarioComida
        updateUsuario(editing.id, usuario)
      } else {
        usuario = {
          id: crypto.randomUUID(),
          fecha_creacion: new Date().toISOString(),
          ...formData,
        } as UsuarioComida
        addUsuario(usuario)
      }

      const allUsuarios = editing
        ? usuarios.map((u) => (u.id === editing.id ? usuario : u))
        : [...usuarios, usuario]

      await fetch('/api/data/usuarios-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allUsuarios),
      })

      setShowForm(false)
      setEditing(null)
      setFormData({ situacion: 'Activo' })
    } catch (err) {
      alert('Error guardando usuario: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar usuario?')) return
    try {
      deleteUsuario(id)
      const updated = usuarios.filter((u) => u.id !== id)
      await fetch('/api/data/usuarios-comidas', {
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
    setFormData({ situacion: 'Activo' })
    setShowForm(true)
  }

  const handleEditOpen = (usuario: UsuarioComida) => {
    setEditing(usuario)
    setFormData(usuario)
    setShowForm(true)
  }

  const getRolLabel = (rol: RolComida) => ROLES.find((r) => r.value === rol)?.label || rol

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>👥 USUARIOS Y PERFILES</h1>
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
            + NUEVO USUARIO
          </button>
        </div>

        {usuarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No hay usuarios. Crea usuarios para acceder al sistema.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ea580c' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Rol</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Último Acceso</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{usuario.nombre}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#aaa' }}>{usuario.email}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>{getRolLabel(usuario.rol)}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          background: usuario.situacion === 'Activo' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                          color: usuario.situacion === 'Activo' ? '#10b981' : '#ef4444',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {usuario.situacion}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#aaa' }}>
                      {usuario.ultimo_acceso
                        ? new Date(usuario.ultimo_acceso).toLocaleDateString()
                        : 'Nunca'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEditOpen(usuario)}
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
                        onClick={() => handleDelete(usuario.id)}
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
                {editing ? '✎ Editar' : '➕ Nuevo'} Usuario
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

              <div style={{ marginBottom: '15px' }}>
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

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Rol *</label>
                <select
                  value={formData.rol || ''}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as RolComida })}
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
                  <option value="">-- Selecciona rol --</option>
                  {ROLES.map((rol) => (
                    <option key={rol.value} value={rol.value}>
                      {rol.label}
                    </option>
                  ))}
                </select>
              </div>

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
                    setFormData({ situacion: 'Activo' })
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
