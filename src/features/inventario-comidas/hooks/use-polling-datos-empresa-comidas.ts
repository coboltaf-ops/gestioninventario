import { useEffect } from 'react'
import { useDatosEmpresaComidasStore } from '../store/datos-empresa-comidas-store'

export function usePollingDatosEmpresaComidas(intervalMs: number = 5000) {
  const setDatosEmpresa = useDatosEmpresaComidasStore((s) => s.setDatosEmpresa)
  const datosEmpresa = useDatosEmpresaComidasStore((s) => s.datosEmpresa)
  const hydrate = useDatosEmpresaComidasStore((s) => s.hydrate)

  useEffect(() => {
    // Hydrate from localStorage on mount
    hydrate()
  }, [hydrate])

  useEffect(() => {
    let isSubscribed = true

    const fetchData = async () => {
      try {
        const res = await fetch('/api/data/datos-empresa-comidas')
        if (res.ok && isSubscribed) {
          const data = await res.json()
          // Only update if server has data (don't overwrite with empty array)
          if (data && data.length > 0) {
            setDatosEmpresa(data[0])
            console.log('[usePollingDatosEmpresaComidas] Updated from server:', data[0])
          } else if (!datosEmpresa) {
            // Only set to null if we don't have local data
            console.log('[usePollingDatosEmpresaComidas] Server returned empty, using localStorage data')
          }
        }
      } catch (err) {
        console.error('[usePollingDatosEmpresaComidas] Error:', err)
      }
    }

    // Don't fetch immediately, wait for hydration first
    const timeoutId = setTimeout(() => {
      if (isSubscribed) {
        fetchData()
      }
    }, 100)

    const interval = setInterval(fetchData, intervalMs)

    return () => {
      isSubscribed = false
      clearTimeout(timeoutId)
      clearInterval(interval)
    }
  }, [setDatosEmpresa, datosEmpresa, intervalMs])
}
