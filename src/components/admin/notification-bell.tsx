'use client'

import { Bell, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useSidebar } from '@/components/admin/sidebar-context'
import { cn } from '@/lib/utils'

interface NotifItem {
  _id: string
  name: string
  activityName: string
  date: string
  time: string
  status: string
  seen: boolean
  createdAt: string
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function fmt(date: string, time: string): string {
  const d = new Date(`${date}T12:00:00`)
  const ds = isNaN(d.getTime())
    ? date
    : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return `${ds} · ${time}`
}

/**
 * Cloche de notifications (haut-droite de l'admin) : badge du nombre de
 * réservations non vues + menu des dernières. Sondage toutes les 45 s.
 */
export function NotificationBell() {
  const { isMobile, mobileOpen } = useSidebar()
  const [items, setItems] = useState<NotifItem[]>([])
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/bookings/notifications', { headers: authHeaders(), signal })
      if (!res.ok) return
      const data = await res.json()
      setItems(Array.isArray(data.items) ? data.items : [])
      setCount(typeof data.count === 'number' ? data.count : 0)
    } catch {
      // silencieux (y compris AbortError au démontage) : la cloche ne casse jamais l'admin
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    const id = setInterval(() => load(controller.signal), 45000)
    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [load])

  // Fermeture au clic extérieur / Échap.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function toggle() {
    const next = !open
    setOpen(next)
    // À l'ouverture, on marque comme vu (le badge se vide ; les surlignages
    // « nouveau » restent visibles jusqu'au prochain rafraîchissement).
    if (next && count > 0) {
      const prev = count
      setCount(0)
      try {
        const res = await fetch('/api/bookings/notifications', { method: 'POST', headers: authHeaders() })
        if (!res.ok) setCount(prev) // échec serveur → on restaure le badge
      } catch {
        setCount(prev)
      }
    }
  }

  // Sur mobile, on s'efface quand le menu latéral est ouvert.
  if (isMobile && mobileOpen) return null

  return (
    <div ref={ref} className="fixed right-3 top-3 z-[55] md:right-6 md:top-4">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative grid size-10 place-items-center rounded-full bg-zinc-900 text-white shadow-lg ring-1 ring-white/10 transition-colors hover:bg-zinc-800"
      >
        <Bell className="size-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground ring-2 ring-zinc-900">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-2xl border border-border bg-popover shadow-[0_30px_70px_-24px_oklch(0.16_0_0/0.45)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Réservations</p>
            <Link
              href="/admin/bookings"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-accent hover:underline"
            >
              Tout voir
            </Link>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Aucune réservation pour le moment.
              </p>
            ) : (
              items.map((it) => (
                <Link
                  key={it._id}
                  href="/admin/bookings"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted',
                    !it.seen && 'bg-accent/5'
                  )}
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                    <CalendarCheck className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{it.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {it.activityName} — {fmt(it.date, it.time)}
                    </span>
                  </span>
                  {!it.seen && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
