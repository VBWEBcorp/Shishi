'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CreditCard,
  LayoutGrid,
  Loader2,
  LogOut,
  MapPin,
  Repeat,
  Ticket,
} from 'lucide-react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getActivity } from '@/lib/activities'
import type { MemberSummary } from '@/lib/member-summary'

interface BookingRow {
  id: string
  activitySlug: string
  activityName: string
  date: string
  time: string
  duration: number
  amount: number
  currency: string
  status: string
  creditsUsed: number
  partySize: number
}

type TabId = 'overview' | 'bookings'

const ease = [0.22, 1, 0.36, 1] as const

export function MemberDashboard() {
  const locale = useLocale() as Locale
  const fr = locale === 'fr'
  const router = useRouter()

  const [member, setMember] = useState<MemberSummary | null>(null)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabId>('overview')

  async function load() {
    try {
      const res = await fetch('/api/member/me', { cache: 'no-store' })
      if (res.status === 401) {
        router.replace(`/${locale}/member/login`)
        return
      }
      const data = await res.json()
      setMember(data.member)
      setBookings(data.bookings ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function logout() {
    await fetch('/api/member/logout', { method: 'POST' })
    router.replace(`/${locale}`)
    router.refresh()
  }

  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—'

  const fmtBookingDate = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString(fr ? 'fr-FR' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-accent" aria-hidden />
      </div>
    )
  }
  if (!member) return null

  const wallets = member.activityCredits
  const totalCredits = wallets.reduce((s, w) => s + w.credits, 0)

  const tabs: {
    id: TabId
    label: string
    short: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number
  }[] = [
    { id: 'overview', label: fr ? 'Mes crédits' : 'My credits', short: fr ? 'Crédits' : 'Credits', icon: LayoutGrid },
    { id: 'bookings', label: fr ? 'Réservations' : 'Bookings', short: fr ? 'Résas' : 'Bookings', icon: CalendarCheck, badge: bookings.length || undefined },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {fr ? 'Espace adhérent' : 'Member area'}
          </span>
          <h1 className="mt-2 font-editorial text-3xl font-normal tracking-[-0.01em] text-foreground sm:text-4xl">
            {fr ? 'Bonjour' : 'Hello'}{member.name ? `, ${member.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{member.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {totalCredits > 0 && (
            <span className="hidden items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent ring-1 ring-accent/20 sm:inline-flex">
              <Ticket className="size-3.5" aria-hidden /> {totalCredits} {fr ? 'crédits' : 'credits'}
            </span>
          )}
          <button
            onClick={logout}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <LogOut className="size-4" aria-hidden /> {fr ? 'Déconnexion' : 'Sign out'}
          </button>
        </div>
      </motion.div>

      {/* Onglets — répartis sur toute la largeur (aucun défilement horizontal) */}
      <div className="mt-8 border-b border-border">
        <div className="flex">
          {tabs.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1 py-3 text-[13px] font-semibold transition-colors sm:gap-2 sm:px-4 sm:text-sm ${
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <t.icon className="hidden size-4 shrink-0 sm:block" aria-hidden />
                <span className="truncate">
                  <span className="sm:hidden">{t.short}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </span>
                {t.badge != null && (
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>
                    {t.badge}
                  </span>
                )}
                {active && (
                  <motion.span
                    layoutId="member-tab"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {/* ───────── MES CRÉDITS ───────── */}
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              {wallets.length > 0 ? (
                <div className="overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.08] via-card to-card p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-editorial text-2xl font-normal text-foreground">
                        {fr ? 'Vos crédits' : 'Your credits'}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <Ticket className="mr-1 inline size-3.5 text-accent" aria-hidden />
                        {fr
                          ? '1 crédit = 1 heure (ou 1 accès) de l’activité. Réservez en ligne : c’est déduit automatiquement.'
                          : '1 credit = 1 hour (or 1 entry) of the activity. Book online: it’s deducted automatically.'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean/10 px-3 py-1.5 text-xs font-semibold text-ocean ring-1 ring-ocean/20">
                      <CalendarClock className="size-3.5" aria-hidden />
                      {fr
                        ? `Réservation jusqu'à ${member.advanceDays} jours à l'avance`
                        : `Book up to ${member.advanceDays} days ahead`}
                    </span>
                  </div>

                  <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {wallets.map((w) => {
                      const activity = getActivity(w.activity)
                      const label = activity ? activity.name[locale] : w.activity
                      return (
                        <li key={w.activity} className="rounded-2xl border border-border bg-background/70 p-5">
                          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {label}
                          </div>
                          <div className="mt-2 flex items-end gap-2">
                            <span className="font-editorial text-5xl font-normal leading-none text-foreground">
                              {w.credits}
                            </span>
                            <span className="mb-1 text-xs text-muted-foreground">
                              {fr ? 'crédits' : 'credits'}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                            {w.monthly > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 font-semibold text-accent">
                                <Repeat className="size-2.5" aria-hidden />
                                {fr ? `${w.monthly} offerts chaque mois` : `${w.monthly} refilled monthly`}
                              </span>
                            ) : null}
                            {w.renewAt && (
                              <span>
                                {w.monthly > 0
                                  ? `${fr ? 'recharge le' : 'refill on'} ${fmtDate(w.renewAt)}`
                                  : `${fr ? 'valables jusqu’au' : 'valid until'} ${fmtDate(w.renewAt)}`}
                              </span>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.08] to-card p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="max-w-xl">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent ring-1 ring-accent/20">
                        <Ticket className="size-3.5" aria-hidden /> {fr ? 'Pas encore de crédits' : 'No credits yet'}
                      </span>
                      <h2 className="mt-3 font-editorial text-2xl font-normal text-foreground sm:text-3xl">
                        {fr ? 'Chargez des crédits au club' : 'Top up your credits at the club'}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {fr
                          ? 'Passez nous voir : l’équipe charge vos crédits sur place (tennis, fitness, kids club, piscine…). Vous pouvez aussi réserver sans crédits et régler sur place.'
                          : 'Come see us: the team tops up your credits on site (tennis, fitness, kids club, pool…). You can also book without credits and pay on site.'}
                      </p>
                    </div>
                    <Link
                      href="/contact-location"
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.5)] transition-all hover:brightness-105"
                    >
                      <MapPin className="size-4" aria-hidden />
                      {fr ? 'Nous trouver' : 'Find us'}
                    </Link>
                  </div>
                </div>
              )}

              {/* Comment ça marche */}
              <section className="mt-10">
                <h2 className="font-editorial text-xl font-normal text-foreground sm:text-2xl">
                  {fr ? 'Comment ça marche' : 'How it works'}
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: MapPin,
                      title: fr ? 'Passez au club' : 'Visit the club',
                      text: fr
                        ? 'L’équipe charge vos crédits sur place (paiement au club) : en ponctuel, valables 1 mois, ou en recharge automatique mensuelle.'
                        : 'The team tops up your credits on site (payment at the club): one-off, valid 1 month, or refilled automatically every month.',
                    },
                    {
                      icon: Ticket,
                      title: fr ? 'Un crédit par activité' : 'Credits per activity',
                      text: fr
                        ? '1 crédit = 1 h (ou 1 accès) de l’activité concernée : vos crédits tennis servent au tennis, vos crédits piscine à la piscine.'
                        : '1 credit = 1 hour (or 1 entry) of that activity: tennis credits are for tennis, pool credits for the pool.',
                    },
                    {
                      icon: CalendarCheck,
                      title: fr ? 'Réservez, c’est déduit' : 'Book, it’s deducted',
                      text: fr
                        ? 'Connecté, vos crédits sont déduits automatiquement à la réservation — et vous réservez jusqu’à 10 jours à l’avance.'
                        : 'Signed in, credits are deducted automatically when you book — and you can book up to 10 days ahead.',
                    },
                  ].map((s, i) => (
                    <div key={s.title} className="relative rounded-2xl border border-border bg-card p-5">
                      <span className="absolute right-4 top-4 font-editorial text-2xl font-normal text-foreground/10">{i + 1}</span>
                      <span className="flex size-10 items-center justify-center rounded-xl bg-ocean/10 text-ocean ring-1 ring-ocean/20">
                        <s.icon className="size-5" aria-hidden />
                      </span>
                      <h3 className="mt-3 text-sm font-semibold text-foreground">{s.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Réserver */}
              <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-5 py-4">
                <CalendarCheck className="size-5 text-accent" aria-hidden />
                <p className="flex-1 text-sm text-foreground">
                  {fr
                    ? 'Prêt à jouer ? Vos crédits sont déduits automatiquement à la réservation.'
                    : 'Ready to play? Your credits are deducted automatically at booking.'}
                </p>
                <Link
                  href="/book-now"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
                >
                  {fr ? 'Réserver' : 'Book now'}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </motion.div>
          )}

          {/* ───────── RÉSERVATIONS ───────── */}
          {tab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-editorial text-2xl font-normal text-foreground">
                    {fr ? 'Vos réservations' : 'Your bookings'}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {fr ? 'Historique de vos sessions et crédits utilisés.' : 'History of your sessions and credits used.'}
                  </p>
                </div>
                <Link
                  href="/book-now"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
                >
                  {fr ? 'Nouvelle réservation' : 'New booking'}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-border bg-secondary/40 px-6 py-12 text-center">
                  <CalendarCheck className="mx-auto size-8 text-muted-foreground/50" aria-hidden />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    {fr ? 'Aucune réservation pour le moment' : 'No bookings yet'}
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
                    {fr ? 'Vos prochaines sessions apparaîtront ici.' : 'Your upcoming sessions will appear here.'}
                  </p>
                  <Link
                    href="/book-now"
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
                  >
                    {fr ? 'Réserver une activité' : 'Book an activity'}
                  </Link>
                </div>
              ) : (
                <div className="mt-6 overflow-hidden rounded-3xl border border-border">
                  {bookings.map((b, i) => {
                    const activity = getActivity(b.activitySlug)
                    const hours = Math.max(1, Math.round(b.duration / 60))
                    return (
                      <div key={b.id} className={`flex flex-wrap items-center gap-3 bg-card px-5 py-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground ring-1 ring-border">
                          <CalendarCheck className="size-4 text-accent" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{activity?.name[locale] ?? b.activityName}</p>
                          <p className="text-xs text-muted-foreground">
                            {fmtBookingDate(b.date)} · {b.time} · {hours} h
                            {b.partySize > 1 ? ` · ${b.partySize} ${fr ? 'pers.' : 'ppl'}` : ''}
                          </p>
                        </div>
                        {b.creditsUsed > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent ring-1 ring-accent/15">
                            <Ticket className="size-3" aria-hidden /> −{b.creditsUsed} {fr ? 'crédit' : 'credit'}{b.creditsUsed > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                            <CreditCard className="size-3.5 text-muted-foreground" aria-hidden />
                            {b.amount.toLocaleString(fr ? 'fr-FR' : 'en-GB')} ฿
                          </span>
                        )}
                        <StatusBadge status={b.status} fr={fr} />
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StatusBadge({ status, fr }: { status: string; fr: boolean }) {
  const map: Record<string, { label: [string, string]; cls: string }> = {
    paid: { label: ['Confirmée', 'Confirmed'], cls: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20' },
    pending: { label: ['En attente', 'Pending'], cls: 'bg-amber-500/10 text-amber-700 ring-amber-500/20' },
    cancelled: { label: ['Annulée', 'Cancelled'], cls: 'bg-muted text-muted-foreground ring-border' },
    failed: { label: ['Échouée', 'Failed'], cls: 'bg-red-500/10 text-red-700 ring-red-500/20' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.cls}`}>
      {fr ? s.label[0] : s.label[1]}
    </span>
  )
}
