import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface State {
  data: any[]
  [key: string]: any
}

export const useFormulasStore = create<State>()(
  persist(
    (set) => ({
      data: [],
    }),
    { name: 'formulas-store-storage' }
  )
)
