'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AdminSidebar, MobileMenuButton } from '@/components/admin/sidebar'
import { NotificationBell } from '@/components/admin/notification-bell'
import { SidebarProvider, useSidebar } from '@/components/admin/sidebar-context'
import { cn } from '@/lib/utils'

const publicPaths = ['/admin/login', '/admin/register']

function AdminMain({ children }: { children: React.ReactNode }) {
  const { collapsed, isMobile } = useSidebar()
  return (
    <main className={cn(
      'min-w-0 flex-1 min-h-screen bg-muted/30 transition-all duration-200',
      isMobile ? 'ml-0' : collapsed ? 'ml-[60px]' : 'ml-[220px]'
    )}>
      {children}
    </main>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const isPublicPage = publicPaths.includes(pathname)

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('authToken')

    // Valide RÉELLEMENT la session côté serveur (signature JWT + rôle admin) au
    // lieu de se fier à la seule présence d'une chaîne dans localStorage. Gère
    // aussi les tokens expirés/invalides : sans ça, l'UI admin s'affichait puis
    // toutes les API renvoyaient 401, laissant une interface cassée.
    const checkAdmin = (t: string) =>
      fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${t}` } })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data?.user?.role === 'admin')
        .catch(() => false)

    if (isPublicPage) {
      // Pages login/register : on les affiche immédiatement, et on ne redirige
      // vers le dashboard que si une session admin VALIDE existe déjà.
      setLoading(false)
      if (token) {
        checkAdmin(token).then((ok) => {
          if (!cancelled && ok) router.push('/admin/dashboard')
        })
      }
      return () => {
        cancelled = true
      }
    }

    if (!token) {
      router.push('/admin/login')
      return () => {
        cancelled = true
      }
    }

    checkAdmin(token).then((ok) => {
      if (cancelled) return
      if (ok) {
        setAuthenticated(true)
        setLoading(false)
      } else {
        localStorage.removeItem('authToken')
        router.push('/admin/login')
      }
    })

    return () => {
      cancelled = true
    }
  }, [router, isPublicPage])

  if (loading) return null
  if (isPublicPage) return children
  if (!authenticated) return null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <MobileMenuButton />
        <NotificationBell />
        <AdminMain>{children}</AdminMain>
      </div>
    </SidebarProvider>
  )
}
