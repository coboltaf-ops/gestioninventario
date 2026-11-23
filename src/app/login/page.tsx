'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth-store'

const NAVY = '#0b1d4a' // SIMAS navy — marca, botón primario
const AZUL_OSCURO = '#0b1d4a' // SIMAS navy — fondo pantalla completa

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)

  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')

  // Al abrir la URL siempre limpiar la sesión anterior y mostrar el login
  // centrado (mismo patrón que los demás sistemas).
  useEffect(() => {
    logout()
  }, [logout])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const ok = login(usuario, clave)
    if (ok) {
      router.replace('/dashboard')
    } else {
      setError('Usuario o clave incorrectos.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto"
      style={{ background: AZUL_OSCURO }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: '#ffffff', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}
      >
        {/* Marca */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-4"
            style={{ background: NAVY }}
          >
            GI
          </div>
          <h1 className="text-xl font-bold" style={{ color: NAVY }}>Gestión de Inventario</h1>
          <p className="text-sm text-slate-400 mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl text-slate-800 outline-none transition-all"
              style={{ background: '#f1f5f9', border: '1px solid rgba(15,23,42,0.12)' }}
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Clave
            </label>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-slate-800 outline-none transition-all"
              style={{ background: '#f1f5f9', border: '1px solid rgba(15,23,42,0.12)' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90 mt-2"
            style={{ background: NAVY }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
