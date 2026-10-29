import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Cliente {
  id: string
  codigo: string
  tipo_identificacion: string
  nro_documento: string
  digito_verificacion: string
  razon_social: string
  macro_sector: string
  actividad: string
  actividad_codigo: string
  direccion: string
  departamento: string
  ciudad: string
  codigo_ciudad: string
  pais: string
  codigo_pais: string
  codigo_postal: string
  telefono: string
  nro_movil: string
  email: string
  sitio_web: string
  condicion_pago: string
  tipo_moneda: string
  calificacion_pagador: string
  representante_legal: string
  tipo_cuenta_cliente: string
  clase_cliente: string
  autoretenedor: string
  agente_retenedor: string
  como_nos_conocio: string
  gran_contribuyente: string
  regimen_iva: string
  clasificacion_tributaria: string
  mes_cierre_anual: string
  retencion_fuente_pct: number
  tipo_retencion_fuente: string
  retencion_iva_pct: number
  tipo_retencion_iva: string
  retencion_ica_pct: number
  cupo_credito: number
  banco_pagos: string
  cuenta_banco: string
  tipo_cuenta_banco: string
  naturaleza_cuenta: string
  observaciones: string
  situacion: string
  fecha_registro: string
  fecha_ingreso_cliente: string
  seguimientos: any[]
  codigo_acceso: string
  tipo_persona: string
  responsabilidades_rut: string
  actividad_dian_ciiu: string
  tipo_regimen: string
  // Campos adicionales que algunas vistas puedan leer sin romper el tipado
  [key: string]: any
}

interface ClientesState {
  clientes: Cliente[]
  addCliente: (cliente: Cliente) => void
  updateCliente: (id: string, cambios: Partial<Cliente>) => void
  deleteCliente: (id: string) => void
}

export const useClientesStore = create<ClientesState>()(
  persist(
    (set) => ({
      clientes: [],
      addCliente: (cliente) => set((s) => ({ clientes: [...s.clientes, cliente] })),
      updateCliente: (id, cambios) =>
        set((s) => ({ clientes: s.clientes.map((c) => (c.id === id ? { ...c, ...cambios } : c)) })),
      deleteCliente: (id) => set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) })),
    }),
    { name: 'clientes-storage' }
  )
)
