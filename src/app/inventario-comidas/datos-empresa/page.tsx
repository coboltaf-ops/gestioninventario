'use client'

import { useState, useEffect } from 'react'
import { useDatosEmpresaComidasStore } from '@/features/inventario-comidas/store/datos-empresa-comidas-store'
import type { DatosEmpresaComida } from '@/features/inventario-comidas/types'

export default function DatosEmpresaComidasPage() {
  const { datosEmpresa, setDatosEmpresa, hydrate } = useDatosEmpresaComidasStore()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<DatosEmpresaComida>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from localStorage on mount
  useEffect(() => {
    hydrate()
    setIsLoading(false)
  }, [hydrate])

  useEffect(() => {
    if (datosEmpresa) {
      setFormData(datosEmpresa)
    }
  }, [datosEmpresa])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño máximo (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('La imagen debe ser menor a 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      // Comprimir si la imagen es muy grande usando canvas
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 800
        const maxHeight = 600
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
          setFormData({ ...formData, logo: compressedBase64 })
        }
      }
      img.src = base64
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      if (!formData.nombre_empresa) {
        alert('Por favor completa el nombre de la empresa')
        return
      }

      const empresa: DatosEmpresaComida = {
        id: datosEmpresa?.id || crypto.randomUUID(),
        ...formData,
      } as DatosEmpresaComida

      setDatosEmpresa(empresa)

      await fetch('/api/data/datos-empresa-comidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([empresa]),
      })

      setEditing(false)
      alert('Datos guardados exitosamente')
    } catch (err) {
      alert('Error guardando datos: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: '#aaa' }}>Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>🏢 DATOS DE LA EMPRESA</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '12px 24px',
                background: '#ea580c',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ✎ EDITAR
            </button>
          )}
        </div>

        {!editing && datosEmpresa ? (
          <div style={{ background: '#000', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
            {datosEmpresa.logo && (
              <div style={{ marginBottom: '30px', textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>LOGO</p>
                <img src={datosEmpresa.logo} alt="Logo Empresa" style={{ maxHeight: 120, maxWidth: 300, objectFit: 'contain' }} />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>NOMBRE</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{datosEmpresa.nombre_empresa}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>NIT</p>
                <p style={{ fontSize: '14px' }}>{datosEmpresa.nit}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>RAZÓN SOCIAL</p>
                <p style={{ fontSize: '14px' }}>{datosEmpresa.razon_social}</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>DIRECCIÓN</p>
              <p style={{ fontSize: '14px' }}>{datosEmpresa.direccion}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>CIUDAD</p>
                <p style={{ fontSize: '14px' }}>{datosEmpresa.ciudad}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>TELÉFONO</p>
                <p style={{ fontSize: '14px' }}>{datosEmpresa.telefono}</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>EMAIL</p>
              <p style={{ fontSize: '14px' }}>{datosEmpresa.email}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>HORARIO APERTURA</p>
                <p style={{ fontSize: '14px' }}>{datosEmpresa.horario_apertura}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>HORARIO CIERRE</p>
                <p style={{ fontSize: '14px' }}>{datosEmpresa.horario_cierre}</p>
              </div>
            </div>
          </div>
        ) : (
          <form
            style={{ background: '#000', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>
                Logo Empresa
              </label>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#222',
                    border: '1px dashed #ea580c',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                />
              </div>
              {formData.logo && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#222', borderRadius: '6px', textAlign: 'center' }}>
                  <img src={formData.logo} alt="Preview Logo" style={{ maxHeight: 100, maxWidth: 200, objectFit: 'contain' }} />
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>
                Nombre Empresa *
              </label>
              <input
                type="text"
                value={formData.nombre_empresa || ''}
                onChange={(e) => setFormData({ ...formData, nombre_empresa: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#222',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>NIT</label>
                <input
                  type="text"
                  value={formData.nit || ''}
                  onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>
                  Razón Social
                </label>
                <input
                  type="text"
                  value={formData.razon_social || ''}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion || ''}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#222',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Ciudad</label>
                <input
                  type="text"
                  value={formData.ciudad || ''}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#222',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>
                  Horario Apertura
                </label>
                <input
                  type="time"
                  value={formData.horario_apertura || ''}
                  onChange={(e) => setFormData({ ...formData, horario_apertura: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>
                  Horario Cierre
                </label>
                <input
                  type="time"
                  value={formData.horario_cierre || ''}
                  onChange={(e) => setFormData({ ...formData, horario_cierre: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                GUARDAR
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  if (datosEmpresa) setFormData(datosEmpresa)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                CANCELAR
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
