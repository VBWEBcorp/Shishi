'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
  collapsed: boolean
  mobileOpen: boolean
  isMobile: boolean
  setCollapsed: (v: boolean) => void
  setMobileOpen: (v: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  mobileOpen: false,
  isMobile: false,
  setCollapsed: () => {},
  setMobileOpen: () => {},
  toggle: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Trois paliers : mobile (<768) menu en overlay, tablette (768–1023)
    // sidebar repliée par défaut pour libérer de la largeur, desktop (≥1024)
    // dépliée. On ne force le repli/dépli qu'au changement de palier, pour ne
    // pas écraser un repli/dépli manuel de l'utilisateur dans un même palier.
    let bucket = ''
    const check = () => {
      const w = window.innerWidth
      setIsMobile(w < 768)
      const next = w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
      if (next !== bucket) {
        bucket = next
        if (next === 'tablet') setCollapsed(true)
        else if (next === 'desktop') setCollapsed(false)
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const toggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, isMobile, setCollapsed, setMobileOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
