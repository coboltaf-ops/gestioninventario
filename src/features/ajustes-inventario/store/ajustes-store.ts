import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface State {
  data: any[]
  [key: string]: any
}

export const useAjustesStore = (storeName: string) =>
  create<State>()(
    persist(
      (set) => ({
        data: [],
      }),
      { name: `${storeName}-storage` }
    )
  )
export const useajustesinventarioStore = store_creator('ajustes-store')
