'use client'

export default function DocumentacionPage() {
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="text-5xl mb-4">📚</div>
        <h1 className="text-2xl font-bold text-white mb-2">Documentación</h1>
        <p className="text-white/60">
          El módulo de documentación aún no está disponible en este entorno.
        </p>
        <p className="text-white/40 text-sm mt-3">
          Próximamente encontrarás aquí las guías y manuales del sistema.
        </p>
      </div>
    </div>
  )
}
