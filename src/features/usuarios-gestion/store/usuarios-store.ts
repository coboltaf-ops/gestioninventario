import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '../types'

interface UsuariosState {
  usuarios: Usuario[]
  addUsuario: (usuario: Usuario) => void
  updateUsuario: (id: string, cambios: Partial<Usuario>) => void
  deleteUsuario: (id: string) => void
}

export const useUsuariosStore = create<UsuariosState>()(
  persist(
    (set) => ({
      usuarios: [],
      addUsuario: (usuario) =>
        set((state) => ({ usuarios: [...state.usuarios, usuario] })),
      updateUsuario: (id, cambios) =>
        set((state) => ({
          usuarios: state.usuarios.map((u) =>
            u.id === id ? { ...u, ...cambios } : u
          ),
        })),
      deleteUsuario: (id) =>
        set((state) => ({
          usuarios: state.usuarios.filter((u) => u.id !== id),
        })),
    }),
    { name: 'usuarios-storage' }
  )
)
