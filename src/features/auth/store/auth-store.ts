import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Credenciales fijas para el demo. Cambia estos valores para otra clave.
export const CREDENCIALES = {
  usuario: 'admin',
  clave: 'admin123',
}

interface AuthState {
  autenticado: boolean
  login: (usuario: string, clave: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      autenticado: false,
      login: (usuario, clave) => {
        const ok =
          usuario.trim().toLowerCase() === CREDENCIALES.usuario.toLowerCase() &&
          clave === CREDENCIALES.clave
        if (ok) set({ autenticado: true })
        return ok
      },
      logout: () => set({ autenticado: false }),
    }),
    { name: 'auth-storage' }
  )
)
