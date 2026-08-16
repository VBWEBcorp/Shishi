'use client'

import { motion } from 'framer-motion'
import {
  BadgePercent,
  BarChart3,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Inbox,
  LayoutGrid,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Table2,
  Ticket,
  TrendingUp,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ActivityIcon } from '@/components/activity-icon'
import { activities } from '@/lib/activities'
import { formatDuration, isBookable, isDayPass, toHHMM, toMinutes } from '@/lib/availability'
import { cn } from '@/lib/utils'
import { NewBookingModal } from './new-booking-modal'
import { WeekAgenda } from './week-agenda'

// Activités concernées par le module de réservation : ouvertes (réservables) ou
// « Bientôt » (prévues mais pas encore lancées, ex. pickleball). Le restaurant,
// qui ne se réserve pas par créneau, n'apparaît pas ici.
const RESERVATION_ACTIVITIES = activities
  .filter((a) => isBookable(a.slug) || a.comingSoon)
  .sort((a, b) => Number(isBookable(b.slug)) - Number(isBookable(a.slug)))
const OPEN_COUNT = RESERVATION_ACTIVITIES.filter((a) => isBookable(a.slug)).length
const SOON_COUNT = RESERVATION_ACTIVITIES.length - OPEN_COUNT

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
  partySize?: number
  participants?: { name: string; email: string; phone?: string }[]
  status: 'pending' | 'paid' | 'cancelled' | 'failed'
  /** Créneau bloqué manuellement (indispo interne, pas un vrai client). */
  blocked?: boolean
  /** Adhérent à l'origine de la réservation (compte membre) — sinon client de passage. */
  memberId?: string
  /** Crédits (par activité) débités pour cette réservation. */
  creditsUsed?: number
  /** Remise adhérent appliquée (0.10 = 10 %). */
  discountRate?: number
  /** Langue de la réservation. */
  locale?: 'en' | 'fr'
  createdAt: string
}

type Counts = Record<string, number>
type View = 'calendar' | 'table' | 'stats'

const ease = [0.22, 1, 0.36, 1] as const

// Plus de paiement en ligne : "paid" = réservation confirmée par l'équipe.
const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'paid', label: 'Confirmées' },
  { key: 'cancelled', label: 'Annulées' },
] as const

// La vue « Cartes » a été retirée : elle affichait la même liste que le détail
// du jour, en doublon du calendrier.
const VIEWS: { key: View; label: string; Icon: typeof CalendarRange }[] = [
  { key: 'calendar', label: 'Calendrier', Icon: CalendarRange },
  { key: 'table', label: 'Tableau', Icon: Table2 },
]

const STATUS_STYLES: Record<Booking['status'], string> = {
  paid: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300',
  pending: 'bg-orange-500/15 text-orange-700 ring-orange-500/30 dark:text-orange-300',
  cancelled: 'bg-zinc-500/15 text-zinc-600 ring-zinc-500/30 dark:text-zinc-300',
  failed: 'bg-red-500/15 text-red-700 ring-red-500/30 dark:text-red-300',
}

const STATUS_DOT: Record<Booking['status'], string> = {
  paid: 'bg-emerald-500',
  pending: 'bg-orange-500',
  cancelled: 'bg-zinc-400',
  failed: 'bg-red-500',
}

const STATUS_CHIP: Record<Booking['status'], string> = {
  paid: 'bg-emerald-500/20 text-emerald-800 ring-1 ring-inset ring-emerald-600/30 dark:text-emerald-200',
  pending: 'bg-orange-500/20 text-orange-800 ring-1 ring-inset ring-orange-600/30 dark:text-orange-200',
  cancelled: 'bg-zinc-400/15 text-zinc-500 line-through dark:text-zinc-400',
  failed: 'bg-red-500/20 text-red-800 ring-1 ring-inset ring-red-600/30 dark:text-red-200',
}

const STATUS_LABEL: Record<Booking['status'], string> = {
  paid: 'Confirmée',
  pending: 'En attente',
  cancelled: 'Annulée',
  failed: 'Échouée',
}

const WEEKDAYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

/** Mémorise le mode d'affichage du calendrier d'une visite à l'autre. */
const CALENDAR_MODE_KEY = 'admin-calendar-mode'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function activityIconName(slug: string): string {
  return activities.find((a) => a.slug === slug)?.icon ?? 'pool'
}

/**
 * Horaire affiché : « Accès journée » pour les pass journée, sinon la PLAGE
 * réelle (07:30 → 09:00 · 1 h 30) — lisible tel quel dans l'emploi du temps,
 * y compris pour les séances saisies à la demi-heure depuis l'admin.
 */
function scheduleLabel(b: Booking): string {
  if (isDayPass(b.activitySlug)) return 'Accès journée'
  if (!/^\d{2}:\d{2}$/.test(b.time ?? '')) return b.time
  const duration = Math.max(0, Math.round(Number(b.duration) || 0))
  if (!duration) return b.time
  return `${b.time} → ${toHHMM(toMinutes(b.time) + duration)} · ${formatDuration(duration)}`
}

/**
 * Nom affiché dans une case du calendrier. `firstNameOnly` sert au téléphone,
 * où la case ne fait qu'une poignée de caractères de large.
 */
function shortName(b: Booking, firstNameOnly = false): string {
  if (b.blocked) return 'Bloqué'
  const full = (b.name || '').trim()
  if (!full) return 'Client'
  return firstNameOnly ? full.split(/\s+/)[0] : full
}

/** Version compacte pour les cases du calendrier : « 07:30–09:00 ». */
function timeRangeLabel(b: Booking): string {
  if (isDayPass(b.activitySlug)) return 'journée'
  if (!/^\d{2}:\d{2}$/.test(b.time ?? '')) return b.time
  const duration = Math.max(0, Math.round(Number(b.duration) || 0))
  if (!duration) return b.time
  return `${b.time}–${toHHMM(toMinutes(b.time) + duration)}`
}

/** Montant à encaisser : « Crédits » si couvert par les crédits du membre, sinon prix en ฿. */
function priceLabel(b: Booking): string {
  const amount = b.amount ?? 0
  if (amount <= 0 && (b.creditsUsed ?? 0) > 0) return 'Crédits'
  return `฿${amount.toLocaleString('fr-FR')}`
}

/** A-t-on une info « membre » à afficher (compte, crédits ou remise) ? */
function hasMemberInfo(b: Booking): boolean {
  return Boolean(b.memberId) || (b.creditsUsed ?? 0) > 0 || (b.discountRate ?? 0) > 0
}

/** Badges membre / crédits débités / remise adhérent — pour distinguer des clients de passage. */
function MemberInfo({ b }: { b: Booking }) {
  const credits = b.creditsUsed ?? 0
  const discount = b.discountRate ?? 0
  if (!hasMemberInfo(b)) return null
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {b.memberId && (
        <span className="inline-flex items-center gap-1 rounded-full bg-ocean/10 px-2 py-0.5 text-[11px] font-semibold text-ocean ring-1 ring-inset ring-ocean/25">
          <CreditCard className="size-3" aria-hidden /> Adhérent
        </span>
      )}
      {credits > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent ring-1 ring-inset ring-accent/20">
          <Ticket className="size-3" aria-hidden /> {credits} crédit{credits > 1 ? 's' : ''}
        </span>
      )}
      {discount > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/25 dark:text-emerald-300">
          <BadgePercent className="size-3" aria-hidden /> −{Math.round(discount * 100)}%
        </span>
      )}
    </div>
  )
}

/** yyyy-mm-dd en heure locale (sans dérive de fuseau). */
function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
function addDays(d: Date, n: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  out.setDate(out.getDate() + n)
  return out
}
/** Lundi de la semaine contenant `d`. */
function startOfWeek(d: Date): Date {
  return addDays(d, -((d.getDay() + 6) % 7))
}
function monthCells(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7 // lundi = 0
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const out: (Date | null)[] = []
  for (let i = 0; i < offset; i++) out.push(null)
  for (let d = 1; d <= days; d++) out.push(new Date(month.getFullYear(), month.getMonth(), d))
  while (out.length % 7 !== 0) out.push(null)
  return out
}

function StatusBadge({ status }: { status: Booking['status'] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${STATUS_STYLES[status]}`}
    >
      <span className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  )
}

const STAT_TONE = {
  emerald: 'text-emerald-600 dark:text-emerald-400',
  orange: 'text-orange-600 dark:text-orange-400',
  accent: 'text-accent',
  default: 'text-foreground',
} as const

function StatCard({
  label, value, sub, tone = 'default',
}: {
  label: string; value: string | number; sub?: string; tone?: keyof typeof STAT_TONE
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn('mt-1 font-display text-2xl font-semibold leading-none', STAT_TONE[tone])}>{value}</p>
      {sub && <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [counts, setCounts] = useState<Counts>({})
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [view, setView] = useState<View>('calendar')
  const [showNew, setShowNew] = useState(false)
  // Données pour l'onglet Statistiques : toutes les réservations, indépendamment du filtre de statut.
  const [allBookings, setAllBookings] = useState<Booking[] | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selectedDay, setSelectedDay] = useState<string>(() => ymd(new Date()))
  // Deux façons de lire le planning : la semaine heure par heure (timeline) ou
  // le mois en cartes. On démarre sur les cartes — c'est la valeur sûre, et la
  // seule qui tienne sans défilement horizontal sur mobile/tablette.
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('month')

  const load = useCallback(
    async (status: string) => {
      setLoading(true)
      try {
        const res = await fetch(`/api/bookings?status=${status}`, { headers: authHeaders() })
        if (res.status === 401) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
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
    },
    [router]
  )

  const loadAll = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/bookings?status=all', { headers: authHeaders() })
      if (res.status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setAllBookings(data.bookings ?? [])
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.push('/admin/login')
      return
    }
    load(filter)
  }, [filter, load, router])

  // Charge (paresseusement) les données stats à l'ouverture de l'onglet.
  useEffect(() => {
    if (view === 'stats' && allBookings === null) loadAll()
  }, [view, allBookings, loadAll])

  const updateStatus = async (id: string, status: Booking['status']) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        await load(filter)
        setAllBookings(null) // invalide le cache stats
      }
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Supprimer définitivement cette réservation ?')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (res.ok) {
        await load(filter)
        setAllBookings(null) // invalide le cache stats
      }
    } finally {
      setBusyId(null)
    }
  }

  const fmtDate = (d: string) => {
    try {
      return fromKey(d).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
    } catch {
      return d
    }
  }
  const fmtReceived = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    } catch {
      return '—'
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return bookings
    return bookings.filter((b) =>
      [b.name, b.email, b.phone, b.activityName].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [bookings, query])

  // Regroupe les réservations par jour (triées par heure) pour la vue calendrier.
  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const b of filtered) {
      const arr = map.get(b.date) ?? []
      arr.push(b)
      map.set(b.date, arr)
    }
    for (const arr of map.values()) arr.sort((a, b) => a.time.localeCompare(b.time))
    return map
  }, [filtered])

  const cells = useMemo(() => monthCells(month), [month])
  const todayKey = ymd(new Date())
  const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(month)

  // Semaine affichée : ancrée sur le jour sélectionné (lundi → dimanche).
  const weekDays = useMemo(() => {
    const monday = startOfWeek(fromKey(selectedDay))
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  }, [selectedDay])
  const weekLabel = useMemo(() => {
    const [from, to] = [weekDays[0], weekDays[6]]
    const sameMonth = from.getMonth() === to.getMonth()
    const fmt = (d: Date, withMonth: boolean) =>
      new Intl.DateTimeFormat('fr-FR', withMonth ? { day: 'numeric', month: 'long' } : { day: 'numeric' }).format(d)
    return `${fmt(from, !sameMonth)} – ${fmt(to, true)} ${to.getFullYear()}`
  }, [weekDays])

  const dayDetailRef = useRef<HTMLDivElement>(null)

  /**
   * Sélection d'un jour. Sur téléphone, la case ne peut afficher que l'heure et
   * le prénom : on amène donc le détail du jour — coordonnées et durée
   * complètes — directement sous les yeux.
   */
  const selectDay = useCallback((key: string) => {
    setSelectedDay(key)
    if (typeof window === 'undefined' || window.matchMedia('(min-width: 640px)').matches) return
    requestAnimationFrame(() =>
      dayDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    )
  }, [])

  /** Recentre le calendrier (et le mois affiché) sur une date donnée. */
  const goToDay = useCallback((d: Date) => {
    setSelectedDay(ymd(d))
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
  }, [])

  // Restaure le mode d'affichage choisi la dernière fois. Sans préférence
  // enregistrée, on ouvre sur la timeline uniquement en grand écran : sur un
  // téléphone ou une tablette, la vue en cartes donne une meilleure vision
  // d'ensemble et évite de défiler latéralement.
  useEffect(() => {
    const saved = localStorage.getItem(CALENDAR_MODE_KEY)
    if (saved === 'week' || saved === 'month') {
      setCalendarMode(saved)
      return
    }
    if (window.matchMedia('(min-width: 1024px)').matches) setCalendarMode('week')
  }, [])

  const pickCalendarMode = useCallback((m: 'week' | 'month') => {
    setCalendarMode(m)
    try {
      localStorage.setItem(CALENDAR_MODE_KEY, m)
    } catch {
      /* stockage indisponible (navigation privée) : le choix vaut pour la session */
    }
  }, [])
  const selectedLabel = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(fromKey(selectedDay))
  const selectedBookings = byDay.get(selectedDay) ?? []

  // Agrégats pour l'onglet Statistiques (calculés sur toutes les réservations).
  const stats = useMemo(() => {
    // Les créneaux bloqués (indispo interne) ne sont pas des clients → exclus des stats.
    const data = (allBookings ?? []).filter((b) => !b.blocked)
    let paid = 0, pending = 0, cancelled = 0, failed = 0, revenue = 0
    let memberCount = 0, creditsUsed = 0
    const actMap = new Map<string, { slug: string; name: string; count: number; revenue: number }>()
    const weekday = [0, 0, 0, 0, 0, 0, 0] // lundi → dimanche
    const hourMap = new Map<number, number>()

    for (const b of data) {
      if (b.status === 'paid') { paid++; revenue += b.amount || 0 }
      else if (b.status === 'pending') pending++
      else if (b.status === 'cancelled') cancelled++
      else if (b.status === 'failed') failed++

      if (b.memberId) memberCount++
      creditsUsed += b.creditsUsed || 0

      const a = actMap.get(b.activitySlug) ?? { slug: b.activitySlug, name: b.activityName, count: 0, revenue: 0 }
      a.count++
      if (b.status === 'paid') a.revenue += b.amount || 0
      actMap.set(b.activitySlug, a)

      weekday[(fromKey(b.date).getDay() + 6) % 7]++

      const h = Number(b.time?.slice(0, 2))
      if (!Number.isNaN(h)) hourMap.set(h, (hourMap.get(h) ?? 0) + 1)
    }

    const activities = [...actMap.values()].sort((x, y) => y.count - x.count)
    const hours = [...hourMap.entries()].sort((x, y) => y[1] - x[1]).slice(0, 5)
    return {
      total: data.length,
      paid, pending, cancelled, failed, revenue,
      memberCount, creditsUsed,
      avg: paid ? Math.round(revenue / paid) : 0,
      confirmRate: data.length ? Math.round((paid / data.length) * 100) : 0,
      activities,
      maxActivity: Math.max(1, ...activities.map((a) => a.count)),
      weekday,
      maxWeekday: Math.max(1, ...weekday),
      hours,
    }
  }, [allBookings])

  /* ---------- Carte réservation (réutilisée : vue Cartes + détail du jour) ---------- */
  function bookingCard(b: Booking) {
    return (
      <div key={b._id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/15">
              <ActivityIcon name={activityIconName(b.activitySlug)} className="size-4" />
            </span>
            {b.activityName}
          </span>
          <StatusBadge status={b.status} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden /> {fmtDate(b.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden /> {scheduleLabel(b)}
          </span>
          {b.partySize && b.partySize > 1 && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden /> {b.partySize} pers.
            </span>
          )}
          <span className="ml-auto font-semibold text-foreground">{priceLabel(b)}</span>
        </div>

        <div className="mt-3 border-t border-border/60 pt-3 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <User className="size-3.5" aria-hidden /> {b.name}
          </span>
          <div className="mt-1 flex flex-col gap-0.5 text-muted-foreground">
            {b.email && (
              <a href={`mailto:${b.email}`} className="inline-flex items-center gap-1.5 hover:text-accent">
                <Mail className="size-3.5" aria-hidden /> {b.email}
              </a>
            )}
            {b.phone && (
              <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1.5 hover:text-accent">
                <Phone className="size-3.5" aria-hidden /> {b.phone}
              </a>
            )}
          </div>
          <MemberInfo b={b} />
          {b.notes && (
            <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{b.notes}</p>
          )}
          {b.participants && b.participants.length > 0 && (
            <div className="mt-2.5 border-t border-border/60 pt-2.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Users className="size-3.5" aria-hidden /> Participants ({b.participants.length})
              </p>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {b.participants.map((pp, i) => (
                  <li key={i} className="truncate">
                    {pp.name} — {pp.email}
                    {pp.phone ? ` · ${pp.phone}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          {b.status !== 'paid' && (
            <button
              onClick={() => updateStatus(b._id, 'paid')}
              disabled={busyId === b._id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/25 disabled:opacity-40 dark:text-emerald-300"
            >
              <Check className="size-3.5" aria-hidden /> Confirmer
            </button>
          )}
          {b.status !== 'cancelled' && (
            <button
              onClick={() => updateStatus(b._id, 'cancelled')}
              disabled={busyId === b._id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-500/15 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-500/25 disabled:opacity-40 dark:text-zinc-300"
            >
              <X className="size-3.5" aria-hidden /> Annuler
            </button>
          )}
          <button
            onClick={() => remove(b._id)}
            disabled={busyId === b._id}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-40 dark:text-red-400"
          >
            <Trash2 className="size-3.5" aria-hidden /> Supprimer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 pt-16 sm:p-6 sm:pt-16 md:pt-6 lg:p-8 lg:pt-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            <CalendarRange className="size-4" aria-hidden />
            Réservations
          </span>
          <h1 className="mt-3 font-editorial text-3xl font-normal leading-tight tracking-[-0.01em] text-foreground sm:text-4xl">
            Gérer les réservations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez et traitez les demandes reçues sur le site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
          >
            <CalendarPlus className="size-4" aria-hidden />
            Nouvelle réservation
          </button>
          <button
            onClick={() => load(filter)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            Rafraîchir
          </button>
        </div>
      </div>

      {showNew && (
        <NewBookingModal
          initialDate={selectedDay}
          onClose={() => setShowNew(false)}
          onCreated={() => {
            load(filter)
            setAllBookings(null) // invalide le cache stats
          }}
        />
      )}

      {/* Activités du module de réservation : ouvertes vs « Bientôt » */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
            <LayoutGrid className="size-4 text-accent" aria-hidden />
            Activités réservables
          </h2>
          <span className="text-xs text-muted-foreground">
            {OPEN_COUNT} ouverte{OPEN_COUNT > 1 ? 's' : ''} · {SOON_COUNT} à venir
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {RESERVATION_ACTIVITIES.map((a) => {
            const open = isBookable(a.slug)
            return (
              <span
                key={a.slug}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm',
                  open ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-orange-500/30 bg-orange-500/10'
                )}
              >
                <span className="flex size-6 items-center justify-center rounded-lg bg-card text-accent ring-1 ring-border">
                  <ActivityIcon name={a.icon} className="size-3.5" />
                </span>
                <span className="font-medium text-foreground">{a.name.fr}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    open
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
                  )}
                >
                  {open ? 'Réservable' : 'Bientôt'}
                </span>
              </span>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Seules les activités « Réservable » apparaissent dans le module de réservation du site. Les autres
          sont marquées « Bientôt » et renvoient vers le contact en attendant.
        </p>
      </div>

      {/* Barre d'outils : sélecteur de vue + recherche */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex w-fit rounded-xl border border-border bg-card p-1">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  view === v.key
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <v.Icon className="size-4" aria-hidden />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          {/* Onglet Statistiques (toggle) */}
          <button
            onClick={() => setView((v) => (v === 'stats' ? 'calendar' : 'stats'))}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
              view === 'stats'
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            )}
          >
            <BarChart3 className="size-4" aria-hidden />
            <span className="hidden sm:inline">Statistiques</span>
          </button>
        </div>

        {view !== 'stats' && (
          <div className="relative w-full sm:w-64 lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom, email, activité…)"
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)] focus-visible:outline-none"
            />
          </div>
        )}
      </div>

      {/* Filtres par statut */}
      {view !== 'stats' && (
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
      )}

      {/* Contenu */}
      {view === 'stats' ? (
        /* ============ VUE STATISTIQUES ============ */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Vue d&apos;ensemble</h2>
            <button
              onClick={loadAll}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <RefreshCw className={cn('size-3.5', statsLoading && 'animate-spin')} aria-hidden />
              Rafraîchir
            </button>
          </div>

          {statsLoading && allBookings === null ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
              <RefreshCw className="mx-auto size-5 animate-spin text-muted-foreground/60" aria-hidden />
              <p className="mt-3">Calcul des statistiques…</p>
            </div>
          ) : stats.total === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <BarChart3 className="mx-auto size-8 text-muted-foreground/50" aria-hidden />
              <p className="mt-3 text-sm font-medium text-foreground">Pas encore de données</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Les statistiques s&apos;afficheront dès les premières réservations.
              </p>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  label="Total réservations"
                  value={stats.total}
                  sub={stats.memberCount > 0 ? `${stats.memberCount} via un compte adhérent` : 'Clients de passage'}
                />
                <StatCard label="Confirmées" value={stats.paid} sub={`${stats.confirmRate}% du total`} tone="emerald" />
                <StatCard label="En attente" value={stats.pending} tone="orange" />
                <StatCard
                  label="CA confirmé"
                  value={`฿${stats.revenue.toLocaleString('fr-FR')}`}
                  sub={`Panier moyen ฿${stats.avg.toLocaleString('fr-FR')}`}
                  tone="accent"
                />
              </div>

              {/* Réservations par activité */}
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                  <BarChart3 className="size-4 text-accent" aria-hidden /> Réservations par activité
                </h3>
                <div className="space-y-3.5">
                  {stats.activities.map((a) => (
                    <div key={a.slug}>
                      <div className="mb-1.5 flex items-center gap-2 text-sm">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/15">
                          <ActivityIcon name={activityIconName(a.slug)} className="size-4" />
                        </span>
                        <span className="truncate font-medium text-foreground">{a.name}</span>
                        <span className="ml-auto flex shrink-0 items-center gap-2 text-xs">
                          {a.revenue > 0 && (
                            <span className="text-muted-foreground">฿{a.revenue.toLocaleString('fr-FR')}</span>
                          )}
                          <span className="font-semibold text-foreground">{a.count}</span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${(a.count / stats.maxActivity) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {/* Fréquentation par jour */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                    <TrendingUp className="size-4 text-accent" aria-hidden /> Fréquentation par jour
                  </h3>
                  <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
                    {stats.weekday.map((n, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{n || ''}</span>
                        <div
                          className="w-full max-w-[30px] rounded-t-md bg-accent/80 transition-all"
                          style={{ height: `${Math.max(4, (n / stats.maxWeekday) * 100)}%` }}
                        />
                        <span className="text-[11px] font-medium uppercase text-muted-foreground">{WEEKDAYS[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Créneaux les plus demandés */}
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                    <Clock className="size-4 text-accent" aria-hidden /> Créneaux les plus demandés
                  </h3>
                  {stats.hours.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune donnée.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {stats.hours.map(([h, n]) => (
                        <div key={h} className="flex items-center gap-3 text-sm">
                          <span className="w-12 shrink-0 font-medium text-foreground">
                            {String(h).padStart(2, '0')}h
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-accent transition-all"
                              style={{ width: `${(n / stats.hours[0][1]) * 100}%` }}
                            />
                          </div>
                          <span className="w-7 shrink-0 text-right text-xs font-semibold text-foreground">{n}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Répartition par statut + dimension membre/crédits */}
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Répartition par statut</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {(['paid', 'pending', 'cancelled', 'failed'] as const).map((s) => (
                    <span key={s} className="inline-flex items-center gap-2">
                      <span className={cn('size-2.5 rounded-full', STATUS_DOT[s])} aria-hidden />
                      <span className="text-muted-foreground">{STATUS_LABEL[s]}</span>
                      <span className="font-semibold text-foreground">{stats[s]}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/60 pt-3 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <CreditCard className="size-3.5 text-ocean" aria-hidden />
                    <span className="text-muted-foreground">Réservations adhérents</span>
                    <span className="font-semibold text-foreground">{stats.memberCount}</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Ticket className="size-3.5 text-accent" aria-hidden />
                    <span className="text-muted-foreground">Crédits débités</span>
                    <span className="font-semibold text-foreground">{stats.creditsUsed}</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          <RefreshCw className="mx-auto size-5 animate-spin text-muted-foreground/60" aria-hidden />
          <p className="mt-3">Chargement…</p>
        </div>
      ) : view === 'calendar' ? (
        /* ============ VUE CALENDRIER ============ */
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
            {/* Navigation : semaine ou mois */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3">
              <h2 className="font-display text-lg font-semibold capitalize text-foreground">
                {calendarMode === 'week' ? weekLabel : monthLabel}
              </h2>
              <div className="flex items-center gap-1.5">
                {/* Calendrier complet (heures) ou cartes seulement */}
                <div className="mr-1 inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
                  {([
                    { key: 'week', short: 'Heures', label: 'Calendrier avec les heures', Icon: Clock },
                    { key: 'month', short: 'Cartes', label: 'Cartes seulement', Icon: LayoutGrid },
                  ] as const).map((m) => (
                    <button
                      key={m.key}
                      onClick={() => pickCalendarMode(m.key)}
                      title={m.label}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                        calendarMode === m.key
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <m.Icon className="size-3.5" aria-hidden />
                      <span className="lg:hidden">{m.short}</span>
                      <span className="hidden lg:inline">{m.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => goToDay(new Date())}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Aujourd&apos;hui
                </button>
                <button
                  onClick={() =>
                    calendarMode === 'week'
                      ? goToDay(addDays(fromKey(selectedDay), -7))
                      : setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                  }
                  aria-label={calendarMode === 'week' ? 'Semaine précédente' : 'Mois précédent'}
                  className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <button
                  onClick={() =>
                    calendarMode === 'week'
                      ? goToDay(addDays(fromKey(selectedDay), 7))
                      : setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                  }
                  aria-label={calendarMode === 'week' ? 'Semaine suivante' : 'Mois suivant'}
                  className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>

            {/* Légende des couleurs */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 pb-3 text-[11px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden /> Confirmées
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-orange-500" aria-hidden /> En attente
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-zinc-400" aria-hidden /> Bloqué / annulé
              </span>
              <span className="ml-auto hidden lg:inline">
                {calendarMode === 'week'
                  ? 'Clic sur une zone libre : ajouter une réservation ce jour-là.'
                  : 'Double-clic sur un jour : ajouter une réservation.'}
              </span>
            </div>

            {calendarMode === 'week' ? (
              <WeekAgenda
                days={weekDays}
                byDay={byDay}
                selectedDay={selectedDay}
                todayKey={todayKey}
                onSelectDay={selectDay}
                onCreate={(key) => {
                  setSelectedDay(key)
                  setShowNew(true)
                }}
              />
            ) : (
              <>
            {/* En-têtes jours */}
            <div className="grid grid-cols-7 gap-1 pb-1 text-center sm:gap-2">
              {WEEKDAYS.map((w) => (
                <span key={w} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {w}
                </span>
              ))}
            </div>

            {/* Grille du mois */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {cells.map((d, i) => {
                if (!d) return <div key={`e${i}`} className="min-h-[96px] sm:min-h-[104px]" />
                const key = ymd(d)
                const dayB = byDay.get(key) ?? []
                const isToday = key === todayKey
                const isSelected = key === selectedDay
                return (
                  <button
                    key={key}
                    onClick={() => selectDay(key)}
                    onDoubleClick={() => {
                      setSelectedDay(key)
                      setShowNew(true)
                    }}
                    title="Double-clic : ajouter une réservation ce jour"
                    className={cn(
                      'flex min-h-[96px] min-w-0 flex-col rounded-xl border p-1.5 text-left transition-colors sm:min-h-[104px]',
                      isSelected
                        ? 'border-accent bg-accent/5 ring-1 ring-accent/40'
                        : 'border-border/60 hover:border-accent/40 hover:bg-muted/40'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                        isToday ? 'bg-accent text-accent-foreground' : 'text-foreground'
                      )}
                    >
                      {d.getDate()}
                    </span>
                    <div className="mt-1 min-w-0 flex-1 space-y-1 overflow-hidden">
                      {dayB.slice(0, 3).map((b, ci) => (
                        <span
                          key={b._id}
                          title={`${scheduleLabel(b)} · ${b.activityName}${b.blocked ? '' : ` · ${b.name}`}`}
                          className={cn(
                            'rounded px-1 py-0.5 text-[10px] font-medium',
                            // Au téléphone les pastilles font deux lignes : on
                            // n'en montre que deux, la 3e passe dans le « +N ».
                            ci === 2 ? 'hidden sm:block' : 'block',
                            b.blocked ? 'bg-zinc-400/20 text-zinc-600 dark:text-zinc-300' : STATUS_CHIP[b.status]
                          )}
                        >
                          {/* Téléphone : deux lignes, l'heure puis le prénom —
                              une case de cette largeur ne tient pas les deux
                              sur la même ligne. À partir de `sm`, tout tient. */}
                          <span className="block truncate font-semibold tabular-nums sm:hidden">
                            {b.time}
                          </span>
                          <span className="block truncate text-[9px] font-normal opacity-80 sm:hidden">
                            {shortName(b, true)}
                          </span>

                          <span className="hidden truncate sm:block">
                            <span className="font-semibold tabular-nums">{timeRangeLabel(b)}</span>{' '}
                            {shortName(b)}
                            <span className="hidden xl:inline"> · {b.activityName}</span>
                          </span>
                        </span>
                      ))}
                      {dayB.length > 2 && (
                        <span className="block px-1 text-[10px] font-medium text-muted-foreground sm:hidden">
                          +{dayB.length - 2}
                        </span>
                      )}
                      {dayB.length > 3 && (
                        <span className="hidden px-1 text-[10px] font-medium text-muted-foreground sm:block">
                          +{dayB.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
              </>
            )}
          </div>

          {/* Détail du jour sélectionné */}
          <div ref={dayDetailRef} className="scroll-mt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold capitalize text-foreground">
                <CalendarDays className="size-4 text-accent" aria-hidden />
                {selectedLabel}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {selectedBookings.length}
                </span>
              </h3>
              <button
                onClick={() => setShowNew(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-all hover:brightness-105"
              >
                <CalendarPlus className="size-3.5" aria-hidden />
                Ajouter une réservation ce jour
              </button>
            </div>
            {selectedBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card py-10 text-center text-sm text-muted-foreground">
                Aucune réservation ce jour-là.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">{selectedBookings.map((b) => bookingCard(b))}</div>
            )}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* ============ ÉTAT VIDE (table / cartes) ============ */
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Inbox className="mx-auto size-8 text-muted-foreground/50" aria-hidden />
          <p className="mt-3 text-sm font-medium text-foreground">
            {query ? 'Aucun résultat' : 'Aucune réservation'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? 'Essayez un autre terme de recherche.' : 'Les demandes passées sur le site apparaîtront ici.'}
          </p>
        </div>
      ) : view === 'table' ? (
        /* ============ VUE TABLEAU ============ */
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Activité</th>
                <th className="px-5 py-3">Date & heure</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Prix</th>
                <th className="px-5 py-3">Reçu le</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <motion.tr
                  key={b._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease, delay: Math.min(i * 0.02, 0.25) }}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-foreground">{b.name}</div>
                    <div className="mt-0.5 flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {b.email && (
                        <a href={`mailto:${b.email}`} className="inline-flex items-center gap-1.5 hover:text-accent">
                          <Mail className="size-3" aria-hidden /> {b.email}
                        </a>
                      )}
                      {b.phone && (
                        <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1.5 hover:text-accent">
                          <Phone className="size-3" aria-hidden /> {b.phone}
                        </a>
                      )}
                    </div>
                    {b.notes && (
                      <p className="mt-1 max-w-[16rem] truncate text-xs italic text-muted-foreground/80" title={b.notes}>
                        “{b.notes}”
                      </p>
                    )}
                    <MemberInfo b={b} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-2 font-medium text-foreground">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/15">
                        <ActivityIcon name={activityIconName(b.activitySlug)} className="size-4" />
                      </span>
                      {b.activityName}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <div className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <CalendarDays className="size-3.5" aria-hidden /> {fmtDate(b.date)}
                    </div>
                    <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs">
                      <Clock className="size-3" aria-hidden /> {scheduleLabel(b)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                    {priceLabel(b)}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{fmtReceived(b.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {b.status !== 'paid' && (
                        <button
                          onClick={() => updateStatus(b._id, 'paid')}
                          disabled={busyId === b._id}
                          title="Confirmer"
                          className="flex size-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-500/15 disabled:opacity-40 dark:text-emerald-400"
                        >
                          <Check className="size-4" aria-hidden />
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(b._id, 'cancelled')}
                          disabled={busyId === b._id}
                          title="Annuler"
                          className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-500/15 disabled:opacity-40 dark:text-zinc-300"
                        >
                          <X className="size-4" aria-hidden />
                        </button>
                      )}
                      <button
                        onClick={() => remove(b._id)}
                        disabled={busyId === b._id}
                        title="Supprimer"
                        className="flex size-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-40 dark:text-red-400"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
