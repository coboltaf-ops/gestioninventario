import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'proveedores.json')
    const data = await readFile(filePath, 'utf-8')
    const proveedores = JSON.parse(data)

    return Response.json(proveedores)
  } catch (error) {
    console.error('Error reading providers data:', error)
    return Response.json({ error: 'Failed to load providers' }, { status: 500 })
  }
}
