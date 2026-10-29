import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Formula {
  id: string
  [key: string]: any
}

interface FormulasState {
  formulas: Formula[]
  addFormula: (formula: Formula) => void
  updateFormula: (id: string, cambios: Partial<Formula>) => void
  deleteFormula: (id: string) => void
}

export const useFormulasStore = create<FormulasState>()(
  persist(
    (set) => ({
      formulas: [],
      addFormula: (formula) => set((state) => ({ formulas: [...state.formulas, formula] })),
      updateFormula: (id, cambios) =>
        set((state) => ({
          formulas: state.formulas.map((f) => (f.id === id ? { ...f, ...cambios } : f)),
        })),
      deleteFormula: (id) =>
        set((state) => ({ formulas: state.formulas.filter((f) => f.id !== id) })),
    }),
    { name: 'formulas-storage' }
  )
)
