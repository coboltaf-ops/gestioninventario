'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  name: string
  href: string
  icon: string
  badge?: string
  submenu?: NavItem[]
}

interface SidebarVtigerProps {
  isOpen: boolean
  items: NavItem[]
  logo: string
}

export function SidebarVtiger({ isOpen, items, logo }: SidebarVtigerProps) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (name: string) => {
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <aside className={`fixed lg:relative left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 flex flex-col transition-all duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-slate-800 font-bold text-lg">
          {logo.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">INVEN</p>
          <p className="text-xs text-gray-500">CRM Inventory</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item, idx) => {
          const isActive = item.href && pathname.startsWith(item.href)
          const hasSubmenu = item.submenu && item.submenu.length > 0
          const isGroupOpen = openGroups[item.name]

          if (hasSubmenu) {
            return (
              <div key={`group-${item.name}-${idx}`} className="mb-2">
                <button
                  onClick={() => toggleGroup(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isGroupOpen
                      ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-semibold text-sm flex-1 text-left">{item.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0L5 14m7-7v12" />
                  </svg>
                </button>
                {isGroupOpen && item.submenu && (
                  <div className="ml-2 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    {item.submenu.map((subitem) => {
                      const isSubActive = pathname.startsWith(subitem.href)
                      return (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                            isSubActive
                              ? 'bg-blue-100 text-blue-600 font-semibold'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-base">{subitem.icon}</span>
                          <span className="flex-1">{subitem.name}</span>
                          {subitem.badge && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                              {subitem.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          if (!item.href) return null

          return (
            <Link
              key={`item-${item.href}-${idx}`}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-100 text-blue-600 border-l-2 border-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm flex-1">{item.name}</span>
              {item.badge && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">v4.0 Enterprise</p>
      </div>
    </aside>
  )
}
