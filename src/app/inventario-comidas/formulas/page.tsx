'use client'

import { useState } from 'react'
import { useFormulasComidasStore, nextFormulaComidaConsecutivo } from '@/features/inventario-comidas/store/formulas-comidas-store'
import { useProductosComidasStore } from '@/features/inventario-comidas/store/productos-comidas-store'
import type { FormulaComida, IngredienteComida } from '@/features/inventario-comidas/types'

export default function FormulasComidasPage() {
  const { formulas, addFormulaComida, updateFormulaComida, deleteFormulaComida } = useFormulasComidasStore()
  const { productos } = useProductosComidasStore()
  const [editing, setEditing] = useState<FormulaComida | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<FormulaComida>>({
    plato_id: '',
    ingredientes: [],
    situacion: 'Activa',
    porciones: 1,
  })

  const platoOptions = productos.filter((p) => p.tipo === 'Plato')
  const mpOptions = productos.filter((p) => p.tipo === 'Materia Prima Cocina')

  const handleSave = async () => {
    try {
      if (!formData.plato_id || !formData.ingredientes || formData.ingredientes.length === 0) {
        alert('Por favor selecciona un plato e ingredientes')
        return
      }

      const platoSeleccionado = productos.find((p) => p.id === formData.plato_id)
      if (!platoSeleccionado) {
        alert('Plato no encontrado')
        return
      }

      let formula: FormulaComida
      if (editing) {
        formula = { ...editing, ...formData } as FormulaComida
        updateFormulaComida(editing.id, formula)
      } else {
        const consecutivo = nextFormulaComidaConsecutivo(formulas)
        formula = {
          id: crypto.randomUUID(),
          consecutivo,
          nombre_receta: formData.nombre_receta || platoSeleccionado.descripcion,
          plato_id: formData.plato_id,
          plato_nombre: platoSeleccionado.descripcion,
          ingredientes: formData.ingredientes,
          porciones: formData.porciones || 1,
          situacion: formData.situacion || 'Activa',
        } as FormulaComida
        addFormulaComida(formula)
      }

      const allFormulas = editing
        ? formulas.map((f) => (f.id === editing.id ? formula : f))
        : [...formulas, formula]

      await fetch('/api/data/formulas-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allFormulas),
      })

      setShowForm(false)
      setEditing(null)
      setFormData({ plato_id: '', ingredientes: [], situacion: 'Activa', porciones: 1 })
    } catch (err) {
      alert('Error guardando receta: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleOpenForm = () => {
    setEditing(null)
    setFormData({ plato_id: '', ingredientes: [], situacion: 'Activa', porciones: 1 })
    setShowForm(true)
  }

  const handleEditOpen = (formula: FormulaComida) => {
    setEditing(formula)
    setFormData(formula)
    setShowForm(true)
  }

  const handleAddIngrediente = () => {
    setFormData({
      ...formData,
      ingredientes: [
        ...(formData.ingredientes || []),
        {
          id: crypto.randomUUID(),
          producto_id: '',
          codigo: '',
          descripcion: '',
          cantidad: 0,
          unidad_medida: '',
        },
      ],
    })
  }

  const handleRemoveIngrediente = (index: number) => {
    const newIngredientes = (formData.ingredientes || []).filter((_, i) => i !== index)
    setFormData({ ...formData, ingredientes: newIngredientes })
  }

  const handleUpdateIngrediente = (index: number, field: keyof IngredienteComida, value: any) => {
    const newIngredientes = [...(formData.ingredientes || [])]
    newIngredientes[index] = { ...newIngredientes[index], [field]: value }
    setFormData({ ...formData, ingredientes: newIngredientes })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar receta?')) return
    try {
      deleteFormulaComida(id)
      const updated = formulas.filter((f) => f.id !== id)
      await fetch('/api/data/formulas-comidas', {
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
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>📖 RECETAS</h1>
          <button
            onClick={handleOpenForm}
            style={{
              padding: '12px 24px',
              background: '#10b981',
              color: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            + AGREGAR RECETA
          </button>
        </div>

        {/* Tabla */}
        {formulas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No hay recetas. Crea una para vincular platos con ingredientes.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #10b981' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Código</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Receta</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Plato</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Ingredientes</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Porciones</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#aaa' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {formulas.map((formula) => (
                  <tr key={formula.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{formula.consecutivo}</td>
                    <td style={{ padding: '12px' }}>{formula.nombre_receta}</td>
                    <td style={{ padding: '12px' }}>{formula.plato_nombre}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#aaa' }}>
                      {formula.ingredientes.length} ingredientes
                    </td>
                    <td style={{ padding: '12px' }}>{formula.porciones}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: formula.situacion === 'Activa' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: formula.situacion === 'Activa' ? '#10b981' : '#ef4444',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}>
                        {formula.situacion}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEditOpen(formula)}
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
                        onClick={() => handleDelete(formula.id)}
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
              maxWidth: '700px',
              width: '90%',
              border: '2px solid #10b981',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <h2 style={{ marginBottom: '20px', fontWeight: 'bold' }}>
                {editing ? '✎ Editar' : '➕ Nueva'} Receta
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa', fontWeight: 'bold' }}>
                  Selecciona Plato *
                </label>
                <select
                  value={formData.plato_id || ''}
                  onChange={(e) => {
                    const plato = productos.find((p) => p.id === e.target.value)
                    setFormData({ ...formData, plato_id: e.target.value })
                  }}
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
                  <option value="">-- Selecciona un plato --</option>
                  {platoOptions.map((plato) => (
                    <option key={plato.id} value={plato.id}>
                      {plato.codigo} - {plato.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa', fontWeight: 'bold' }}>
                  Porciones
                </label>
                <input
                  type="number"
                  value={formData.porciones || 1}
                  onChange={(e) => setFormData({ ...formData, porciones: parseInt(e.target.value) || 1 })}
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

              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <label style={{ fontSize: '14px', color: '#aaa', fontWeight: 'bold' }}>Ingredientes *</label>
                  <button
                    onClick={handleAddIngrediente}
                    style={{
                      padding: '6px 12px',
                      background: '#10b981',
                      color: '#1e293b',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    + Agregar
                  </button>
                </div>

                {(formData.ingredientes || []).map((ingrediente, index) => {
                  const mpSeleccionado = mpOptions.find((mp) => mp.id === ingrediente.producto_id)
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '15px',
                        background: '#f1f5f9',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        border: '1px solid #333',
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
                            Ingrediente
                          </label>
                          <select
                            value={ingrediente.producto_id || ''}
                            onChange={(e) => {
                              const mp = mpOptions.find((m) => m.id === e.target.value)
                              if (mp) {
                                handleUpdateIngrediente(index, 'producto_id', mp.id)
                                handleUpdateIngrediente(index, 'codigo', mp.codigo)
                                handleUpdateIngrediente(index, 'descripcion', mp.descripcion)
                                handleUpdateIngrediente(index, 'unidad_medida', mp.unidad_medida)
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: '#222',
                              border: '1px solid #333',
                              borderRadius: '4px',
                              color: '#1e293b',
                              fontSize: '12px',
                              boxSizing: 'border-box',
                            }}
                          >
                            <option value="">-- Selecciona --</option>
                            {mpOptions.map((mp) => (
                              <option key={mp.id} value={mp.id}>
                                {mp.codigo} - {mp.descripcion}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
                            Cantidad
                          </label>
                          <input
                            type="number"
                            value={ingrediente.cantidad || 0}
                            onChange={(e) => handleUpdateIngrediente(index, 'cantidad', parseFloat(e.target.value) || 0)}
                            step="0.1"
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: '#222',
                              border: '1px solid #333',
                              borderRadius: '4px',
                              color: '#1e293b',
                              fontSize: '12px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        <button
                          onClick={() => handleRemoveIngrediente(index)}
                          style={{
                            padding: '6px 10px',
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
                      </div>
                      {mpSeleccionado && (
                        <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                          Unidad: {mpSeleccionado.unidad_medida}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Estado</label>
                <select
                  value={formData.situacion || 'Activa'}
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
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
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
                    setFormData({ plato_id: '', ingredientes: [], situacion: 'Activa', porciones: 1 })
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
