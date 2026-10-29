import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Usuario = {
  id?: string
  nombre?: string
  apellido?: string
  rol?: string
  correo?: string
  [key: string]: any
}

interface CurrentUserState {
  user: Usuario
  setUser: (u: Usuario) => void
  logout: () => void
  esAdmin: () => boolean
}

export const useCurrentUserStore = create<CurrentUserState>()(
  persist(
    (set, get) => ({
      user: {
        id: '1',
        nombre: 'Usuario',
        apellido: 'Sistema',
        rol: 'admin',
        correo: 'admin@sistema.com',
      },
      setUser: (u) => set({ user: u }),
      // Indica si el usuario actual tiene rol de administrador.
      esAdmin: () => {
        const rol = (get().user?.rol ?? '').toLowerCase()
        return rol === 'admin' || rol === 'administrador'
      },
      logout: () =>
        set({
          user: {
            id: '1',
            nombre: 'Usuario',
            apellido: 'Sistema',
            rol: 'admin',
            correo: 'admin@sistema.com',
          },
        }),
    }),
    { name: 'current-user-storage' }
  )
)
