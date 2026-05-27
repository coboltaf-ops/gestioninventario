import { NextRequest, NextResponse } from 'next/server'
import { readCollection, writeCollection, readJson, writeJson } from '@/lib/db'

const ALLOWED = [
  'productos', 'proveedores', 'bodegas', 'centros-costo',
  'ordenes-compra', 'correos-enviados', 'usuarios', 'referencias',
  'recepcion-facturas', 'transferencias', 'ajustes-inventario', 'carga-inicial',
  'modulos-sistema', 'personal-empresa', 'tareas', 'pedidos',
  'pagos-proveedores', 'datos-empresa', 'control-bancario', 'pesaje', 'despachos', 'clientes',
  'hoja-proceso', 'pedidos-comidas', 'cierre-caja', 'formulas',
  'productos-comidas', 'formulas-comidas',
  'proveedores-comidas', 'ordenes-compra-comidas', 'recepcion-facturas-comidas', 'bodegas-comidas',
  'salidas-almacen-comidas', 'ajustes-inventario-comidas', 'inventario-fisico-comidas',
  'datos-empresa-comidas', 'usuarios-comidas', 'clientes-comidas',
]

type RouteContext = { params: Promise<{ collection: string }> }

type UsuarioRecord = { id: string; usuario: string; clave?: string; [k: string]: unknown }

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { collection } = await ctx.params
    console.log(`[API] GET ${collection}`)

    if (!ALLOWED.includes(collection)) {
      return NextResponse.json({ error: 'Colección no permitida' }, { status: 400 })
    }

    if (collection === 'referencias' || collection === 'pagos-proveedores' || collection === 'control-bancario') {
      const data = await readJson(collection, {})
      return NextResponse.json(data)
    }

    const data = await readCollection(collection)

    if (collection === 'usuarios' && Array.isArray(data)) {
      const sanitized = (data as UsuarioRecord[]).map(u => {
        const { clave: _omit, ...rest } = u
        void _omit
        return rest
      })
      return NextResponse.json(sanitized)
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error(`[API] Error en GET ${ctx.params}:`, err)
    // Devolver array vacío en caso de error
    return NextResponse.json([])
  }
}

export async function OPTIONS(_req: NextRequest, ctx: RouteContext) {
  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { collection } = await ctx.params
  if (!ALLOWED.includes(collection)) {
    return NextResponse.json({ error: 'Colección no permitida' }, { status: 400 })
  }
  const text = await req.text()
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // En Vercel, los datos se guardan solo en localStorage del cliente
  // No intentar guardar en filesystem porque no persiste
  const isVercel = !!process.env.VERCEL
  if (isVercel) {
    console.log(`[PUT] ${collection} - Vercel serverless (datos en localStorage del cliente)`)
    return NextResponse.json({ ok: true, serverless: true })
  }

  try {
    if (collection === 'referencias' || collection === 'pagos-proveedores' || collection === 'control-bancario') {
      await writeJson(collection, body)
    } else if (collection === 'usuarios' && Array.isArray(body)) {
      // SEGURIDAD: el cliente NO maneja claves. Si un usuario llega sin clave o vacía,
      // se preserva la clave existente del Blob. Solo se sobrescribe si llega clave nueva.
      const existing = await readCollection<UsuarioRecord>('usuarios', [])
      const existingById = new Map(existing.map(u => [u.id, u]))
      const merged = (body as UsuarioRecord[]).map(u => {
        const existingClave = existingById.get(u.id)?.clave
        const newClave = (u.clave || '').toString().trim()
        if (newClave) {
          // Cliente envió clave nueva → usarla
          return { ...u, clave: newClave }
        }
        // Cliente no envió clave → preservar la existente (o vacía si es nuevo)
        return { ...u, clave: existingClave || '' }
      })
      await writeCollection(collection, merged)
    } else {
      await writeCollection(collection, body as unknown[])
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`PUT ${collection} error:`, msg)
    // Si falla la escritura pero el cliente ya tiene los datos en localStorage, devolver 200 anyway
    // Los datos están persistidos en el cliente
    return NextResponse.json({ ok: true, note: 'Datos persistidos en cliente' }, { status: 200 })
  }
}
