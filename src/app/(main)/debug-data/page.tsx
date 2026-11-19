'use client'

import { useState } from 'react'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { useProveedoresStore } from '@/features/proveedores/store/proveedores-store'
import { useOrdenesStore } from '@/features/ordenes-compra/store/ordenes-store'
import { useRecepcionesStore } from '@/features/recepcion-facturas/store/recepciones-store'
import { useOrdenesProduccionStore } from '@/features/produccion/store/ordenes-produccion-store'
import { usePesajeStore } from '@/features/pesaje/store/pesaje-store'
import { useBodegasStore } from '@/features/bodegas/store/bodegas-store'
import { useCentrosCostoStore } from '@/features/centros-costo/store/centros-costo-store'

// ─────────────────────────────────────────────────────────────────────────────
// Datos base (nombres realistas en español)
// ─────────────────────────────────────────────────────────────────────────────

const NOMBRES_MAP = [
  'Harina de Trigo', 'Azúcar Refinada', 'Aceite Vegetal', 'Sal Marina', 'Levadura Fresca',
  'Mantequilla sin Sal', 'Huevos Frescos', 'Leche en Polvo', 'Cacao en Polvo', 'Esencia de Vainilla',
  'Margarina Industrial', 'Polvo de Hornear', 'Canela Molida', 'Almidón de Maíz', 'Nueces Peladas',
]

const NOMBRES_PTER = [
  'Pan Integral 500g', 'Galletas Avena x12', 'Pan Blanco Molde', 'Croissant Mantequilla', 'Baguette Artesanal',
  'Muffin Arándano', 'Torta Chocolate', 'Brownie x6', 'Pan Dulce', 'Donas Glaseadas x6',
  'Galletas Chips Chocolate x12', 'Pan Ciabatta', 'Bizcocho Vainilla', 'Empanada de Pollo', 'Pan Hamburguesa x8',
  'Tostadas Integrales', 'Galletas Mantequilla x24', 'Pan Centeno', 'Rollo de Canela x4', 'Pan Pita x6',
  'Cupcake Vainilla x6', 'Pan Francés', 'Galletas Jengibre x12', 'Torta Zanahoria', 'Pan de Leche x4',
  'Alfajor x6', 'Pan Molde Integral', 'Galletas Coco x12', 'Panqué de Limón', 'Pan Semillas 600g',
]

const NOMBRES_PROD = [
  'Caja Cartón 30x30', 'Cinta de Embalaje', 'Bolsa Papel Kraft x100', 'Etiqueta Adhesiva x500', 'Film Plástico Rollo',
]

const NOMBRES_PROVEEDORES = [
  'Molinos del Valle S.A.S', 'Distribuidora Azucarera Nacional', 'Aceites y Grasas Premium Ltda', 'Lácteos La Pradera S.A.',
  'Insumos Panaderos del Caribe', 'Comercializadora El Trigal', 'Importadora de Cacao Andino', 'Suministros Industriales Bogotá',
  'Empaques y Cajas del Norte', 'Distribuciones La Espiga Dorada', 'Alimentos y Materias El Sol', 'Proveedora Dulce Hogar S.A.S',
  'Grupo Agroindustrial Colombia', 'Mayorista de Harinas Express', 'Insumos Gourmet Internacional',
]

const CIUDADES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Manizales', 'Pereira']
const CONTACTOS = ['Juan Pérez', 'María Gómez', 'Carlos Rodríguez', 'Ana Martínez', 'Luis Hernández', 'Diana Torres', 'Jorge Ramírez', 'Paula Suárez']
const COMPRADORES = ['Juan Pérez', 'María Gómez', 'Carlos Rodríguez', 'Ana Martínez']
const UNIDADES = ['Kg', 'Litro', 'Unidad', 'Caja', 'Bolsa']
const CONDICIONES_PAGO = ['Contado', 'Crédito 30 días', 'Crédito 60 días']
const CONDUCTORES = ['Pedro Gutiérrez', 'Andrés Castro', 'Miguel Ortiz', 'Fernando Díaz', 'Ricardo Peña']

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const uid = () => crypto.randomUUID()
const pick = <T,>(arr: T[], i: number): T => arr[i % arr.length]
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const round2 = (n: number) => Math.round(n * 100) / 100

// Fecha ISO 'YYYY-MM-DD' hace N días (hoy = 2026-11-18)
const fechaHaceDias = (dias: number): string => {
  const d = new Date(2026, 10, 18) // noviembre (0-index) 18, 2026
  d.setDate(d.getDate() - dias)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const pad5 = (n: number) => String(n).padStart(5, '0')

type Dict = Record<string, any>

// ─────────────────────────────────────────────────────────────────────────────
// Generadores
// ─────────────────────────────────────────────────────────────────────────────

function genProveedores(): Dict[] {
  return NOMBRES_PROVEEDORES.map((nombre, i) => ({
    id: uid(),
    nombre,
    tipo_id: 'NIT',
    nro_documento: `90${rnd(0, 9)}.${rnd(100, 999)}.${rnd(100, 999)}-${rnd(0, 9)}`,
    actividad: 'Comercio al por mayor de alimentos e insumos',
    correo: `ventas@${nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '').slice(0, 14)}.com`,
    telf_oficina: `60${rnd(1, 8)} ${rnd(200, 799)} ${rnd(1000, 9999)}`,
    movil_oficina: `3${rnd(0, 2)}${rnd(0, 9)} ${rnd(200, 799)} ${rnd(1000, 9999)}`,
    persona_contacto: pick(CONTACTOS, i),
    referencias: '',
    observacion_referencia: '',
    direccion: `Calle ${rnd(1, 120)} # ${rnd(1, 80)}-${rnd(1, 99)}`,
    ciudad: pick(CIUDADES, i),
    pais: 'Colombia',
    tipo_inventario_atiende: 'Materia Prima',
    situacion: 'Activo',
    tipo_persona: 'Jurídica',
    regimen_iva: 'Responsable de IVA',
    autorretenedor_renta: 'No',
    gran_contribuyente: i % 5 === 0 ? 'Sí' : 'No',
    regimen_tributario: 'Ordinario',
    agente_retenedor_iva: 'No',
    actividad_ciiu: `${rnd(1000, 9999)}`,
    pct_retencion_renta: 2.5,
    pct_retencion_iva: 15,
    pct_retencion_ica: 0.414,
    responsable_ica: 'Sí',
    responsabilidades_rut: 'O-13; O-15',
    resolucion_facturacion: `186400${rnd(100000, 999999)}`,
    correo_notificacion_dian: `dian@${nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '').slice(0, 10)}.com`,
  }))
}

// Construye un producto completo que respeta la forma del initForm de productos
function nuevoProducto(opts: {
  tipo: string
  prefix: string
  seq: number
  nombre: string
  costo: number
  precio: number
  unidad: string
  proveedorNombre: string
}): Dict {
  const codigo = `${opts.prefix}-${pad5(opts.seq)}`
  return {
    id: uid(),
    codigo,
    descripcion: opts.nombre,
    tipo_inventario: opts.tipo,
    categoria: opts.tipo === 'Producto Terminado' ? 'Panadería' : 'Insumos',
    grupo: opts.tipo === 'Producto Terminado' ? 'Horneados' : 'Básicos',
    sub_grupo: '',
    ult_costo: opts.costo,
    costo_promedio: opts.costo,
    precio_unitario: opts.precio,
    ult_proveedor: opts.proveedorNombre,
    codigo_barra: codigo,
    maximo: 1000,
    minimo: 50,
    unidad_medida: opts.unidad,
    existencia: rnd(80, 600),
    usa_seriales: false,
    situacion: 'Activo',
    imagen: '',
  }
}

function genProductos(proveedores: Dict[]): { map: Dict[]; pter: Dict[]; prod: Dict[]; todos: Dict[] } {
  const map = NOMBRES_MAP.map((n, i) =>
    nuevoProducto({
      tipo: 'Materia Prima',
      prefix: 'MAP',
      seq: i + 1,
      nombre: n,
      costo: rnd(1500, 18000),
      precio: 0,
      unidad: pick(['Kg', 'Litro', 'Unidad'], i),
      proveedorNombre: pick(proveedores, i).nombre,
    })
  )
  const pter = NOMBRES_PTER.map((n, i) => {
    const costo = rnd(1200, 9000)
    return nuevoProducto({
      tipo: 'Producto Terminado',
      prefix: 'PTER',
      seq: i + 1,
      nombre: n,
      costo,
      precio: round2(costo * (1.4 + Math.random() * 0.6)),
      unidad: 'Unidad',
      proveedorNombre: pick(proveedores, i).nombre,
    })
  })
  const prod = NOMBRES_PROD.map((n, i) =>
    nuevoProducto({
      tipo: 'Materiales y Suministros',
      prefix: 'PROD',
      seq: i + 1,
      nombre: n,
      costo: rnd(300, 4500),
      precio: 0,
      unidad: pick(['Unidad', 'Caja', 'Rollo', 'Paquete'], i),
      proveedorNombre: pick(proveedores, i).nombre,
    })
  )
  return { map, pter, prod, todos: [...map, ...pter, ...prod] }
}

function genBodegas(): Dict[] {
  const base = [
    { nombre: 'Bodega Materia Prima', tipo: 'Materia Prima', dir: 'Bodega Ppal SPIN Caldas' },
    { nombre: 'Bodega Producto Terminado', tipo: 'Producto Terminado', dir: 'Centro de Distribución Caldas' },
    { nombre: 'Bodega Materiales', tipo: 'Materiales y Suministros', dir: 'Almacén de Suministros' },
  ]
  return base.map((b) => ({
    id: uid(),
    nombre: b.nombre,
    correo: 'bodega@spin.com',
    telefono: `60${rnd(1, 8)} ${rnd(200, 799)} ${rnd(1000, 9999)}`,
    direccion: b.dir,
    ciudad: 'Caldas',
    pais: 'Colombia',
    tipo_inventario: b.tipo,
    situacion: 'Activa',
  }))
}

function genCentrosCosto(): Dict[] {
  const base = [
    { codigo: 'CC-01', descripcion: 'Producción' },
    { codigo: 'CC-02', descripcion: 'Administración' },
    { codigo: 'CC-03', descripcion: 'Logística y Distribución' },
  ]
  return base.map((c) => ({ id: uid(), codigo: c.codigo, descripcion: c.descripcion, situacion: 'Activo' }))
}

// Órdenes de compra: referencian proveedores reales y productos reales (MAP + PROD)
function genOrdenes(
  proveedores: Dict[],
  productosCompra: Dict[],
  bodegaMP: Dict,
  centros: Dict[]
): Dict[] {
  const situaciones = ['Pendiente', 'Aprobada', 'Recibida', 'Recibida Parcial']
  const ordenes: Dict[] = []
  for (let i = 0; i < 20; i++) {
    const prov = pick(proveedores, i)
    const situacion = pick(situaciones, i)
    const centro = pick(centros, i)
    const nLineas = rnd(1, 4)
    const detalles: Dict[] = []
    for (let j = 0; j < nLineas; j++) {
      const p = productosCompra[(i * 3 + j) % productosCompra.length]
      const cantidad = rnd(10, 200)
      const costo = p.ult_costo || rnd(1000, 10000)
      const subtotal = round2(cantidad * costo)
      let cantidad_recibida = 0
      let estado_renglon: 'Pendiente' | 'Recibido' | 'Anulado' = 'Pendiente'
      let recibido = false
      if (situacion === 'Recibida') {
        cantidad_recibida = cantidad
        estado_renglon = 'Recibido'
        recibido = true
      } else if (situacion === 'Recibida Parcial') {
        cantidad_recibida = Math.floor(cantidad / 2)
      }
      detalles.push({
        id: uid(),
        codigo_producto: p.codigo,
        descripcion: p.descripcion,
        cantidad,
        costo_unitario: costo,
        unidad_medida: p.unidad_medida || 'Unidad',
        subtotal,
        recibido,
        estado_renglon,
        cantidad_recibida,
      })
    }
    const diasAtras = 60 - i * 3
    const fechaEmision = fechaHaceDias(diasAtras)
    const aprobada = situacion !== 'Pendiente'
    ordenes.push({
      id: uid(),
      nro_orden: i + 1,
      consecutivo: `OC-${pad5(i + 1)}`,
      fecha_emision: fechaEmision,
      fecha_vencimiento: fechaHaceDias(diasAtras - 30),
      tipo_inventario: 'Materia Prima',
      proveedor: prov.nombre,
      fecha_llegada: aprobada ? fechaHaceDias(diasAtras - 7) : '',
      tipo_moneda: 'COP',
      comprador: pick(COMPRADORES, i),
      condicion_pago: pick(CONDICIONES_PAGO, i),
      fecha_aprobacion: aprobada ? fechaHaceDias(diasAtras - 2) : '',
      observaciones: '',
      detalles,
      pct_impuesto: 19,
      bodega_llegada: bodegaMP.nombre,
      centro_costo: `${centro.codigo} - ${centro.descripcion}`,
      situacion,
    })
  }
  return ordenes
}

// Recepciones de factura: referencian 15 órdenes de compra reales
function genRecepciones(ordenes: Dict[]): Dict[] {
  const seleccionadas = ordenes.slice(0, 15)
  return seleccionadas.map((oc, i) => {
    const renglones = (oc.detalles as Dict[]).map((d) => ({
      detalle_id: d.id,
      codigo_producto: d.codigo_producto,
      descripcion: d.descripcion,
      unidad_medida: d.unidad_medida,
      cantidad_pedida: d.cantidad,
      costo_unitario: d.costo_unitario,
      ya_recibido: 0,
      cantidad_a_recibir: d.cantidad,
      completo: true,
    }))
    const dias = 50 - i * 3
    return {
      id: uid(),
      nro_recepcion: i + 1,
      consecutivo: `RF-${pad5(i + 1)}`,
      nro_factura: `FV-${rnd(1000, 9999)}`,
      tipo_inventario: 'Materia Prima',
      fecha_emision: fechaHaceDias(dias),
      fecha_recibida: fechaHaceDias(dias - 1),
      orden_compra_id: oc.id,
      orden_compra_consecutivo: oc.consecutivo,
      proveedor: oc.proveedor,
      bodega_llegada: oc.bodega_llegada,
      comprador: oc.comprador,
      persona_recibe: pick(CONTACTOS, i),
      fecha_aprobacion: oc.fecha_aprobacion || fechaHaceDias(dias),
      renglones,
      observaciones: '',
      estado: 'Aprobada y Recibida',
    }
  })
}

// Órdenes de producción: referencian Productos Terminados reales
function genOrdenesProduccion(productosTerminados: Dict[]): Dict[] {
  const situaciones = ['Pendiente', 'En Proceso', 'Completada', 'En Proceso']
  const clientes = ['Supermercados La Canasta', 'Cafetería Central', 'Distribuidora El Buen Pan', 'Hotel Plaza Mayor']
  return Array.from({ length: 4 }).map((_, i) => {
    const pt = pick(productosTerminados, i * 7)
    const situacion = pick(situaciones, i)
    const cantidad = rnd(50, 500)
    const dias = 40 - i * 8
    return {
      id: uid(),
      nro_orden: i + 1,
      consecutivo: `OPR-${pad5(i + 1)}`,
      fecha_emision: fechaHaceDias(dias),
      fecha_programada: fechaHaceDias(dias - 3),
      fecha_ejecucion: situacion === 'Completada' ? fechaHaceDias(dias - 4) : '',
      cliente: pick(clientes, i),
      cliente_id: '',
      producto_terminado_id: pt.id,
      producto_terminado_codigo: pt.codigo,
      producto_terminado_codigo_spin: pt.codigo,
      producto_terminado_nombre: pt.descripcion,
      cantidad_a_producir: cantidad,
      cantidad_producida: situacion === 'Completada' ? cantidad : situacion === 'En Proceso' ? Math.floor(cantidad / 2) : 0,
      unidad_medida: 'Unidad',
      lineas: [],
      responsable: pick(CONTACTOS, i),
      observaciones: '',
      situacion,
    }
  })
}

// Pesajes: referencian un proveedor, una orden de compra y una materia prima
function genPesajes(proveedores: Dict[], ordenes: Dict[], productosMP: Dict[]): Dict[] {
  return Array.from({ length: 3 }).map((_, i) => {
    const prov = pick(proveedores, i)
    const oc = pick(ordenes, i)
    const prod = pick(productosMP, i * 4)
    const p1 = rnd(12000, 25000)
    const p2 = rnd(3000, 8000)
    const dias = 30 - i * 7
    return {
      id: uid(),
      nro_correlativo: i + 1,
      consecutivo: `P-${pad5(i + 1)}`,
      fecha_registro: fechaHaceDias(dias),
      nro_documento: `REM-${rnd(1000, 9999)}`,
      fecha_emision: fechaHaceDias(dias),
      proveedor: prov.nombre,
      orden_compra_id: oc.id,
      orden_compra_consecutivo: oc.consecutivo,
      producto_id: prod.id,
      producto_materia_prima: prod.descripcion,
      placas: `${['ABC', 'XYZ', 'KLM'][i % 3]}${rnd(100, 999)}`,
      descripcion: `Camión de carga - ${prod.descripcion}`,
      modelo: `${rnd(2015, 2024)}`,
      cedula_conductor: `${rnd(10000000, 99999999)}`,
      nombre_conductor: pick(CONDUCTORES, i),
      primera_pesada: p1,
      segunda_pesada: p2,
      peso_neto: Math.abs(p1 - p2),
      nro_lote: `LOTE-${rnd(1000, 9999)}`,
      observaciones: '',
      tipo_inventario: 'Materia Prima',
      estado: 'Registrado',
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────────────────

const CARD = 'rgba(15,23,42,0.04)'
const BORDER = 'rgba(15,23,42,0.1)'
const BLUE = 'rgba(59,130,246,1)'
const ORANGE = '#ea580c'

export default function DebugDataPage() {
  // Suscripciones en vivo para el panel de conteos
  const productos = useProductosStore((s) => s.productos)
  const proveedores = useProveedoresStore((s) => s.proveedores)
  const ordenes = useOrdenesStore((s) => s.ordenes)
  const recepciones = useRecepcionesStore((s) => s.recepciones)
  const ordenesProduccion = useOrdenesProduccionStore((s) => s.ordenes)
  const pesajes = usePesajeStore((s) => s.pesajes)
  const bodegas = useBodegasStore((s) => s.bodegas)
  const centros = useCentrosCostoStore((s) => s.centros)

  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'clear'; texto: string } | null>(null)

  const countsMP = productos.filter((p: Dict) => p.tipo_inventario === 'Materia Prima').length
  const countsPT = productos.filter((p: Dict) => p.tipo_inventario === 'Producto Terminado').length
  const countsMS = productos.filter((p: Dict) => p.tipo_inventario === 'Materiales y Suministros').length

  const cargarDatos = () => {
    try {
      const proveedoresGen = genProveedores()
      const { map, pter, prod, todos } = genProductos(proveedoresGen)
      const bodegasGen = genBodegas()
      const centrosGen = genCentrosCosto()
      const bodegaMP = bodegasGen.find((b) => b.tipo_inventario === 'Materia Prima') || bodegasGen[0]
      const productosCompra = [...map, ...prod] // Materia Prima + Materiales
      const ordenesGen = genOrdenes(proveedoresGen, productosCompra, bodegaMP, centrosGen)
      const recepcionesGen = genRecepciones(ordenesGen)
      const produccionGen = genOrdenesProduccion(pter)
      const pesajesGen = genPesajes(proveedoresGen, ordenesGen, map)

      // Reemplaza (no agrega) para mantener idempotencia entre clics
      useProductosStore.setState({ productos: todos })
      useProveedoresStore.setState({ proveedores: proveedoresGen })
      useBodegasStore.setState({ bodegas: bodegasGen })
      useCentrosCostoStore.setState({ centros: centrosGen as any })
      useOrdenesStore.setState({ ordenes: ordenesGen })
      useRecepcionesStore.setState({ recepciones: recepcionesGen as any })
      useOrdenesProduccionStore.setState({ ordenes: produccionGen as any })
      usePesajeStore.setState({ pesajes: pesajesGen as any })

      setMensaje({
        tipo: 'ok',
        texto:
          `✅ Datos cargados: ${map.length} Materia Prima, ${pter.length} Producto Terminado, ${prod.length} Materiales, ` +
          `${proveedoresGen.length} Proveedores, ${ordenesGen.length} Órdenes de Compra, ${recepcionesGen.length} Recepciones, ` +
          `${produccionGen.length} Órdenes de Producción, ${pesajesGen.length} Pesajes, ${bodegasGen.length} Bodegas, ${centrosGen.length} Centros de Costo.`,
      })
    } catch (e: any) {
      setMensaje({ tipo: 'clear', texto: `⚠️ Error al generar datos: ${e?.message || e}` })
    }
  }

  const borrarDatos = () => {
    useProductosStore.setState({ productos: [] })
    useProveedoresStore.setState({ proveedores: [] })
    useBodegasStore.setState({ bodegas: [] })
    useCentrosCostoStore.setState({ centros: [] })
    useOrdenesStore.setState({ ordenes: [] })
    useRecepcionesStore.setState({ recepciones: [] })
    useOrdenesProduccionStore.setState({ ordenes: [] })
    usePesajeStore.setState({ pesajes: [] })
    setMensaje({ tipo: 'clear', texto: '🗑️ Todos los datos de prueba fueron borrados.' })
  }

  const filas: { label: string; valor: number; detalle?: string }[] = [
    { label: 'Productos (total)', valor: productos.length, detalle: `MP: ${countsMP} · PT: ${countsPT} · Mat: ${countsMS}` },
    { label: 'Proveedores', valor: proveedores.length },
    { label: 'Órdenes de Compra', valor: ordenes.length },
    { label: 'Recepción de Facturas', valor: recepciones.length },
    { label: 'Órdenes de Producción', valor: ordenesProduccion.length },
    { label: 'Pesajes', valor: pesajes.length },
    { label: 'Bodegas', valor: bodegas.length },
    { label: 'Centros de Costo', valor: centros.length },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: ORANGE }}>
          Datos de Prueba
        </h1>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          Esta página genera un conjunto de datos de demostración <strong>coherente y enlazado</strong>:
          productos, proveedores, órdenes de compra, recepciones, producción y pesajes conectados entre sí
          (las órdenes referencian proveedores y productos reales; las recepciones referencian órdenes reales).
          Úsala para poblar la aplicación antes de una demo. Los datos se guardan en el navegador (localStorage).
        </p>
      </div>

      {/* Botones */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={cargarDatos}
          className="px-6 py-3 rounded-xl text-base font-bold text-white shadow-sm transition-transform active:scale-95"
          style={{ background: ORANGE }}
        >
          ✅ Cargar datos de prueba
        </button>
        <button
          onClick={borrarDatos}
          className="px-6 py-3 rounded-xl text-base font-bold text-slate-800 transition-transform active:scale-95"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}
        >
          🗑️ Borrar todos los datos
        </button>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: mensaje.tipo === 'ok' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${mensaje.tipo === 'ok' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.3)'}`,
            color: '#1e293b',
          }}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Panel de conteos */}
      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Registros actuales por store</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filas.map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${BORDER}` }}
            >
              <div>
                <div className="text-sm font-semibold text-slate-800">{f.label}</div>
                {f.detalle && <div className="text-xs text-slate-500 mt-0.5">{f.detalle}</div>}
              </div>
              <div className="text-2xl font-extrabold tabular-nums" style={{ color: f.valor > 0 ? BLUE : 'rgba(15,23,42,0.25)' }}>
                {f.valor}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cantidades objetivo */}
      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Cantidades que genera el seeder</h2>
        <ul className="text-sm text-slate-500 space-y-1 list-disc pl-5">
          <li>15 Productos de Materia Prima (prefijo MAP-)</li>
          <li>30 Productos Terminados (prefijo PTER-)</li>
          <li>5 Materiales y Suministros (prefijo PROD-)</li>
          <li>15 Proveedores · 20 Órdenes de Compra · 15 Recepciones de Factura</li>
          <li>4 Órdenes de Producción · 3 Pesajes</li>
          <li>3 Bodegas · 3 Centros de Costo (soporte de coherencia)</li>
        </ul>
      </div>
    </div>
  )
}
