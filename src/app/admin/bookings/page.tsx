'use client'

import { motion } from 'framer-motion'
import { Calendar, Check, Clock, Mail, Phone, RefreshCw, Trash2, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Booking {
  _id: string
  activitySlug: string
  activityName: string
  date: string
  time: string
  duration: number
  name: string
  email: string
  phone?: string
  notes?: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'cancelled' | 'failed'
  createdAt: string
}

type Counts = Record<string, number>

const ease = [0.22, 1, 0.36, 1] as const

const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'paid', label: 'Payées' },
  { key: 'pending', label: 'En attente' },
  { key: 'cancelled', label: 'Annulées' },
  { key: 'failed', label: 'Échouées' },
] as const

const STATUS_STYLES: Record<Booking['status'], string> = {
  paid: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300',
  pending: 'bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300',
  cancelled: 'bg-zinc-500/15 text-zinc-600 ring-zinc-500/30 dark:text-zinc-300',
  failed: 'bg-red-500/15 text-red-700 ring-red-500/30 dark:text-red-300',
}

const STATUS_LABEL: Record<Booking['status'], string> = {
  paid: 'Payée',
  pending: 'En attente',
  cancelled: 'Annulée',
  failed: 'Échouée',
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [counts, setCounts] = useState<Counts>({})
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings?status=${status}`, { headers: authHeaders() })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setBookings(data.bookings ?? [])
      setCounts(data.counts ?? {})
    } catch (err) {
      console.error('Failed to load bookings:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.push('/admin/login')
      return
    }
    load(filter)
  }, [filter, load, router])

  const updateStatus = async (id: string, status: Booking['status']) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) load(filter)
  }

  const remove = async (id: string) => {
    if (!confirm('Supprimer définitivement cette réservation ?')) return
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (res.ok) load(filter)
  }

  const fmtDate = (d: string) => {
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      })
    } catch { return d }
  }

  return (
    <div className="space-y-6 p-4 pt-12 sm:p-6 sm:pt-12 lg:p-8 lg:pt-12">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
            Réservations
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Gérer les réservations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez et gérez les demandes de réservation reçues sur le site.
          </p>
        </div>
        <button
          onClick={() => load(filter)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
          Rafraîchir
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-accent text-accent-foreground'
                : 'border border-border bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            {f.label}
            <span className={`rounded-full px-1.5 text-xs ${filter === f.key ? 'bg-black/15' : 'bg-muted'}`}>
              {counts[f.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Chargement…</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Calendar className="mx-auto size-8 text-muted-foreground/50" aria-hidden />
          <p className="mt-3 text-sm font-medium text-foreground">Aucune réservation</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Les réservations passées sur le site apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b, i) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease, delay: Math.min(i * 0.03, 0.3) }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Activité + créneau */}
                <div className="min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-semibold text-foreground">{b.activityName}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${STATUS_STYLES[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" aria-hidden /> {fmtDate(b.date)}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" aria-hidden /> {b.time}</span>
                  </div>
                </div>

                {/* Client */}
                <div className="min-w-[180px] text-sm">
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground"><User className="size-3.5" aria-hidden /> {b.name}</span>
                  <div className="mt-1 flex flex-col gap-0.5 text-muted-foreground">
                    <a href={`mailto:${b.email}`} className="inline-flex items-center gap-1.5 hover:text-accent"><Mail className="size-3.5" aria-hidden /> {b.email}</a>
                    {b.phone && <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1.5 hover:text-accent"><Phone className="size-3.5" aria-hidden /> {b.phone}</a>}
                  </div>
                </div>

                {/* Montant */}
                <div className="text-right">
                  <div className="font-display text-lg font-bold text-foreground">฿{b.amount.toLocaleString('fr-FR')}</div>
                  <div className="text-xs text-muted-foreground">{b.duration} min</div>
                </div>
              </div>

              {b.notes && (
                <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{b.notes}</p>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                {b.status !== 'paid' && (
                  <button onClick={() => updateStatus(b._id, 'paid')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/25 dark:text-emerald-300">
                    <Check className="size-3.5" aria-hidden /> Marquer payée
                  </button>
                )}
                {b.status !== 'cancelled' && (
                  <button onClick={() => updateStatus(b._id, 'cancelled')} className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-500/15 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-500/25 dark:text-zinc-300">
                    <X className="size-3.5" aria-hidden /> Annuler
                  </button>
                )}
                <button onClick={() => remove(b._id)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400">
                  <Trash2 className="size-3.5" aria-hidden /> Supprimer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
