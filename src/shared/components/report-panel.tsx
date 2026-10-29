'use client'

import { useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

type Column = { header: string; key: string; width?: number }

type FilterOption = string | number | { id: any; nombre: string } | null | undefined

type Filter = { label: string; key: string; options: FilterOption[] }

type Props = {
  title: string
  filename: string
  columns: Column[]
  rows: Record<string, any>[]
  filters?: Filter[]
  summableKeys?: string[]
}

// Normalize a filter option to a display label.
function optionLabel(opt: FilterOption): string {
  if (opt && typeof opt === 'object') return String(opt.nombre ?? opt.id ?? '')
  return String(opt ?? '')
}

// A stable value we store in the <select> for a chosen option.
function optionValue(opt: FilterOption): string {
  if (opt && typeof opt === 'object') return String(opt.id ?? opt.nombre ?? '')
  return String(opt ?? '')
}

// Loose comparison: a row matches the chosen option if the row value equals
// either the option's string form, its `nombre`, or its `id`.
function rowMatchesOption(rowValue: any, opt: FilterOption | undefined): boolean {
  if (opt === undefined) return true
  const rv = String(rowValue ?? '')
  if (opt && typeof opt === 'object') {
    return rv === String(opt.id ?? '') || rv === String(opt.nombre ?? '')
  }
  return rv === String(opt)
}

// Format a cell for display / export.
function formatCell(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    // Common shape coming from relations.
    if ('nombre' in value) return String((value as any).nombre ?? '')
    return JSON.stringify(value)
  }
  return String(value)
}

function toNumber(value: any): number {
  if (typeof value === 'number') return isFinite(value) ? value : 0
  if (value === null || value === undefined) return 0
  // Strip anything that is not part of a number (currency symbols, thousands sep).
  const cleaned = String(value).replace(/[^0-9.-]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

export default function ReportPanel({
  title,
  filename,
  columns,
  rows,
  filters = [],
  summableKeys = [],
}: Props) {
  // selected[filter.key] holds the chosen optionValue, or '' for "Todos".
  const [selected, setSelected] = useState<Record<string, string>>({})

  const filteredRows = useMemo(() => {
    if (!filters.length) return rows
    return rows.filter(row =>
      filters.every(f => {
        const chosen = selected[f.key]
        if (!chosen) return true // "Todos"
        const opt = f.options.find(o => optionValue(o) === chosen)
        return rowMatchesOption(row[f.key], opt)
      }),
    )
  }, [rows, filters, selected])

  const totals = useMemo(() => {
    if (!summableKeys.length) return null
    const acc: Record<string, number> = {}
    for (const key of summableKeys) {
      acc[key] = filteredRows.reduce((sum, r) => sum + toNumber(r[key]), 0)
    }
    return acc
  }, [filteredRows, summableKeys])

  const setFilter = (key: string, value: string) =>
    setSelected(prev => ({ ...prev, [key]: value }))

  // ── Export: Excel ────────────────────────────────────────────────────────
  const exportExcel = () => {
    const data = filteredRows.map(row => {
      const out: Record<string, string> = {}
      for (const col of columns) out[col.header] = formatCell(row[col.key])
      return out
    })
    const ws = XLSX.utils.json_to_sheet(data, {
      header: columns.map(c => c.header),
    })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  // ── Export: PDF (manual grid, no autotable) ────────────────────────────────
  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginX = 32
    const marginTop = 48
    const usableWidth = pageWidth - marginX * 2

    // Title.
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(title, marginX, 32)

    // Column widths: honor provided weights, else distribute evenly.
    const weights = columns.map(c => (c.width && c.width > 0 ? c.width : 1))
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1
    const colWidths = weights.map(w => (w / weightSum) * usableWidth)

    const rowHeight = 18
    const lineAt = (y: number) =>
      doc.line(marginX, y, marginX + usableWidth, y)

    let y = marginTop

    const drawHeader = () => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      let x = marginX
      columns.forEach((col, i) => {
        doc.text(doc.splitTextToSize(col.header, colWidths[i] - 4)[0] ?? '', x + 2, y + 12)
        x += colWidths[i]
      })
      lineAt(y)
      lineAt(y + rowHeight)
      y += rowHeight
    }

    drawHeader()

    doc.setFont('helvetica', 'normal')
    const bodyRows = filteredRows.length ? filteredRows : []

    for (const row of bodyRows) {
      if (y + rowHeight > pageHeight - 32) {
        doc.addPage()
        y = marginTop
        drawHeader()
        doc.setFont('helvetica', 'normal')
      }
      let x = marginX
      columns.forEach((col, i) => {
        const text = doc.splitTextToSize(formatCell(row[col.key]), colWidths[i] - 4)[0] ?? ''
        doc.text(text, x + 2, y + 12)
        x += colWidths[i]
      })
      lineAt(y + rowHeight)
      y += rowHeight
    }

    if (!bodyRows.length) {
      doc.setFont('helvetica', 'italic')
      doc.text('Sin registros', marginX + 2, y + 12)
      y += rowHeight
    }

    // Totals row in the PDF.
    if (totals && bodyRows.length) {
      if (y + rowHeight > pageHeight - 32) {
        doc.addPage()
        y = marginTop
      }
      doc.setFont('helvetica', 'bold')
      let x = marginX
      columns.forEach((col, i) => {
        let text = ''
        if (i === 0) text = 'Totales'
        else if (summableKeys.includes(col.key)) text = formatNumber(totals[col.key])
        doc.text(doc.splitTextToSize(text, colWidths[i] - 4)[0] ?? '', x + 2, y + 12)
        x += colWidths[i]
      })
      lineAt(y)
      lineAt(y + rowHeight)
    }

    doc.save(`${filename}.pdf`)
  }

  return (
    <div
      className="rounded-xl p-5 md:p-6"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header row: title + export buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportPdf}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{
              background: 'rgba(234,88,12,0.18)',
              border: '1px solid rgba(234,88,12,0.5)',
            }}
          >
            📄 Exportar PDF
          </button>
          <button
            type="button"
            onClick={exportExcel}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{
              background: 'rgba(59,130,246,0.18)',
              border: '1px solid rgba(59,130,246,0.5)',
            }}
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5">
          {filters.map(f => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs text-white/50">{f.label}</label>
              <select
                value={selected[f.key] ?? ''}
                onChange={e => setFilter(f.key, e.target.value)}
                className="rounded-lg px-3 py-2 text-sm text-white outline-none min-w-[140px]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <option value="" style={{ background: '#1a1a1a' }}>
                  Todos
                </option>
                {f.options.map((opt, i) => (
                  <option
                    key={`${optionValue(opt)}-${i}`}
                    value={optionValue(opt)}
                    style={{ background: '#1a1a1a' }}
                  >
                    {optionLabel(opt)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Preview count */}
      <p className="text-xs text-white/50 mb-2">
        {filteredRows.length} registro{filteredRows.length === 1 ? '' : 's'}
      </p>

      {/* Preview table */}
      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 font-semibold text-white whitespace-nowrap"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-4 py-8 text-center text-white/50"
                >
                  Sin registros
                </td>
              </tr>
            ) : (
              filteredRows.map((row, ri) => (
                <tr key={ri} className="transition-colors hover:bg-white/[0.03]">
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className="px-4 py-2.5 text-white/80 whitespace-nowrap"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {formatCell(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {totals && filteredRows.length > 0 && (
            <tfoot>
              <tr style={{ background: 'rgba(234,88,12,0.1)' }}>
                {columns.map((col, i) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 font-bold text-white whitespace-nowrap"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    {i === 0
                      ? 'Totales'
                      : summableKeys.includes(col.key)
                      ? formatNumber(totals[col.key])
                      : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-PY', { maximumFractionDigits: 2 }).format(n)
}
