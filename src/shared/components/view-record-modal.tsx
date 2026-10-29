'use client'

type Field = {
  label: string
  value: string | number | boolean | null | undefined
}

type Props = {
  title: string
  fields: Field[]
  onClose: () => void
}

export default function ViewRecordModal({ title, fields, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: 'rgba(34,197,94,0.95)', border: '2px solid #16a34a' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl transition-colors">&times;</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.5)' }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#86efac' }}>{f.label}</p>
              <p className="text-white font-medium text-sm">
                {typeof f.value === 'boolean' ? (f.value ? 'Sí' : 'No') : (f.value || '—')}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-white font-medium text-sm transition-all"
            style={{ background: 'rgba(34,197,94,0.3)', border: '1px solid #16a34a', color: '#dcfce7' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
