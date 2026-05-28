import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'ordenes-compra.json')
    const data = await readFile(filePath, 'utf-8')
    const ordenes = JSON.parse(data)

    return Response.json(ordenes)
  } catch (error) {
    console.error('Error reading purchase orders data:', error)
    return Response.json({ error: 'Failed to load purchase orders' }, { status: 500 })
  }
}
