'use client'

import { ReactNode, useState } from 'react'

interface FormField {
  label: string
  name: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox'
  placeholder?: string
  value?: string | number
  options?: { value: string | number; label: string }[]
  required?: boolean
  disabled?: boolean
  cols?: number
}

interface FormSection {
  title: string
  icon?: string
  fields: FormField[]
  collapsible?: boolean
  defaultOpen?: boolean
}

interface FormCardProps {
  title: string
  sections: FormSection[]
  onSubmit?: (data: Record<string, any>) => void
  submitLabel?: string
  tabs?: boolean
}

export function FormCard({ title, sections, onSubmit, submitLabel = 'Guardar', tabs = false }: FormCardProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    sections.reduce((acc, section, idx) => ({
      ...acc,
      [idx]: section.defaultOpen !== false,
    }), {})
  )
  const [activeTab, setActiveTab] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const toggleSection = (idx: number) => {
    setOpenSections(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const renderField = (field: FormField) => {
    const baseInputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={handleChange}
            disabled={field.disabled}
            className={`${baseInputClass} resize-none`}
            rows={4}
          />
        )
      case 'select':
        return (
          <select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            disabled={field.disabled}
            className={baseInputClass}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )
      case 'checkbox':
        return (
          <input
            type="checkbox"
            name={field.name}
            checked={formData[field.name] || false}
            onChange={handleChange}
            disabled={field.disabled}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        )
      default:
        return (
          <input
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={handleChange}
            disabled={field.disabled}
            className={baseInputClass}
          />
        )
    }
  }

  const renderSection = (section: FormSection, idx: number) => {
    const isOpen = openSections[idx]

    return (
      <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden mb-4">
        {section.collapsible ? (
          <>
            <button
              onClick={() => toggleSection(idx)}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition text-left"
            >
              <span className="text-lg">{section.icon || '📋'}</span>
              <span className="font-semibold text-gray-900 flex-1">{section.title}</span>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0L5 14m7-7v12" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-6 py-4 bg-white">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${section.fields[0]?.cols || 2}, minmax(0, 1fr))` }}>
                  {section.fields.map((field, fidx) => (
                    <div key={fidx}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="px-6 py-4 bg-white">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-lg">{section.icon || '📋'}</span>
              {section.title}
            </h3>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${section.fields[0]?.cols || 2}, minmax(0, 1fr))` }}>
              {section.fields.map((field, fidx) => (
                <div key={fidx}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Tabs */}
      {tabs && sections.length > 1 && (
        <div className="px-6 border-b border-gray-200 flex gap-1 bg-gray-50">
          {sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-3 font-medium text-sm transition-all border-b-2 ${
                activeTab === idx
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {section.icon} {section.title}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-6">
        {tabs ? (
          renderSection(sections[activeTab], activeTab)
        ) : (
          sections.map((section, idx) => renderSection(section, idx))
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-slate-800 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
