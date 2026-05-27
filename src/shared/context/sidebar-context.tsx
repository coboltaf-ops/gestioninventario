'use client'

import { createContext, useContext, useState } from 'react'

interface SidebarContextType {
  sidebarVisible: boolean
  toggleSidebar: () => void
  showSidebar: () => void
  hideSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  return (
    <SidebarContext.Provider
      value={{
        sidebarVisible,
        toggleSidebar: () => setSidebarVisible(!sidebarVisible),
        showSidebar: () => setSidebarVisible(true),
        hideSidebar: () => setSidebarVisible(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar debe usarse dentro de SidebarProvider')
  }
  return context
}
