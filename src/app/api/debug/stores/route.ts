import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Los stores son de cliente y no se pueden acceder desde el servidor.',
    hint: 'Abre la consola del navegador en http://localhost:3000/proveedores y verifica los datos cargados',
  })
}
