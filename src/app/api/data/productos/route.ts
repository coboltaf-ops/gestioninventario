import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'productos.json')
    const data = await readFile(filePath, 'utf-8')
    const productos = JSON.parse(data)

    return Response.json(productos)
  } catch (error) {
    console.error('Error reading products data:', error)
    return Response.json({ error: 'Failed to load products' }, { status: 500 })
  }
}
