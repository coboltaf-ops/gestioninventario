import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface State {
  data: any[]
  [key: string]: any
}

export const useOrdenesProduccionStore = (storeName: string) =>
  create<State>()(
    persist(
      (set) => ({
        data: [],
      }),
      { name: `${storeName}-storage` }
    )
  )
export const useproduccionStore = store_creator('ajustes-mp-store')
