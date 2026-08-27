'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const DOC_PASSWORD = 'Liberiapalomares151056*'
const SESSION_KEY = 'doc-biblioteca-auth'

// ─── Types ───────────────────────────────────────────────────────────────────

type ModalState = 'closed' | 'password' | 'library'

// ─── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value === DOC_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onSuccess()
    } else {
      setError(true)
      setShaking(true)
      setValue('')
      setTimeout(() => setShaking(false), 500)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] px-8">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-white mb-1">Acceso Protegido</h2>
      <p className="text-slate-400 text-sm mb-6 text-center">
        Ingresa la contraseña para acceder a la Biblioteca de Documentación
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false) }}
          placeholder="Contraseña"
          autoComplete="off"
          className={`w-full px-4 py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 border-2 outline-none transition-all
            ${error ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'}
            ${shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
        />
        {error && (
          <p className="text-red-400 text-xs text-center -mt-1">
            Contraseña incorrecta. Intenta de nuevo.
          </p>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-white transition-all
            bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500
            active:scale-95 shadow-lg shadow-blue-900/40"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}

// ─── Library Modal ────────────────────────────────────────────────────────────

function LibraryModal({ onClose }: { onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Trap keyboard: Escape closes
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Biblioteca de Documentación"
        className="fixed inset-4 z-[9999] flex flex-col rounded-2xl overflow-hidden shadow-2xl
          ring-1 ring-white/10"
        style={{ background: '#0f172a' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed, #db2777)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">
                Biblioteca de Documentación
              </h2>
              <p className="text-blue-100 text-xs">Centro de documentación centralizado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70
              hover:text-white hover:bg-white/15 transition-all focus:outline-none
              focus:ring-2 focus:ring-white/50"
            aria-label="Cerrar biblioteca"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Iframe content */}
        <iframe
          ref={iframeRef}
          src="/docs-view/biblioteca"
          className="flex-1 border-0 w-full"
          title="Biblioteca de Documentación"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </>
  )
}

// ─── Floating Doc Button (main export) ───────────────────────────────────────

export function FloatingDocButton() {
  const [modalState, setModalState] = useState<ModalState>('closed')
  const [tooltip, setTooltip] = useState(false)

  const handleOpen = useCallback(() => {
    const isAuthed = sessionStorage.getItem(SESSION_KEY) === '1'
    setModalState(isAuthed ? 'library' : 'password')
  }, [])

  const handleClose = useCallback(() => {
    setModalState('closed')
  }, [])

  const handlePasswordSuccess = useCallback(() => {
    setModalState('library')
  }, [])

  const isOpen = modalState !== 'closed'

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end gap-2">
        {/* Tooltip */}
        {tooltip && !isOpen && (
          <div className="mb-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap
            pointer-events-none select-none
            shadow-lg animate-fade-in"
            style={{
              background: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            Biblioteca de Documentación
            {/* Arrow */}
            <span className="absolute -bottom-1.5 right-5 w-3 h-3 rotate-45"
              style={{ background: 'rgba(15,23,42,0.95)', borderRight: '1px solid rgba(255,255,255,0.15)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}
            />
          </div>
        )}

        <button
          onClick={isOpen ? handleClose : handleOpen}
          onMouseEnter={() => setTooltip(true)}
          onMouseLeave={() => setTooltip(false)}
          aria-label={isOpen ? 'Cerrar biblioteca' : 'Abrir biblioteca de documentación'}
          className="relative w-14 h-14 rounded-full flex items-center justify-center
            text-2xl font-bold text-white shadow-2xl
            transition-all duration-300
            hover:scale-110 active:scale-95
            focus:outline-none focus:ring-4 focus:ring-blue-400/50"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #dc2626, #9f1239)'
              : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            boxShadow: isOpen
              ? '0 8px 32px rgba(220,38,38,0.5), 0 0 0 3px rgba(220,38,38,0.2)'
              : '0 8px 32px rgba(37,99,235,0.5), 0 0 0 3px rgba(37,99,235,0.2)',
          }}
        >
          {/* Pulse ring when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
            />
          )}
          <span className="relative z-10 transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}
          >
            {isOpen ? '✕' : '📚'}
          </span>
        </button>
      </div>

      {/* Password gate modal */}
      {modalState === 'password' && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ingresa contraseña"
            className="fixed z-[9999] inset-0 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
              style={{ background: '#0f172a' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed, #db2777)' }}
              >
                <span className="text-white font-bold text-sm">Biblioteca de Documentación</span>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70
                    hover:text-white hover:bg-white/15 transition-all"
                  aria-label="Cerrar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <PasswordGate onSuccess={handlePasswordSuccess} />
            </div>
          </div>
        </>
      )}

      {/* Library modal */}
      {modalState === 'library' && (
        <LibraryModal onClose={handleClose} />
      )}
    </>
  )
}
