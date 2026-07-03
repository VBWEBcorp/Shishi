'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BadgePercent,
  CalendarCheck,
  CalendarClock,
  Check,
  CreditCard,
  LayoutGrid,
  Loader2,
  LogOut,
  RefreshCw,
  Sparkles,
  Ticket,
} from 'lucide-react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { getActivity } from '@/lib/activities'
import { PAID_PLANS, getPlan, type MembershipPlan } from '@/lib/membership-plans'
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

type TabId = 'overview' | 'membership' | 'bookings'

const ease = [0.22, 1, 0.36, 1] as const

export function MemberDashboard() {
  const locale = useLocale() as Locale
  const fr = locale === 'fr'
  const router = useRouter()

  const [member, setMember] = useState<MemberSummary | null>(null)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<MembershipPlan | null>(null)
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

  async function subscribe(plan: MembershipPlan) {
    setSubscribing(plan)
    try {
      const res = await fetch('/api/member/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (res.ok) setMember(data.member)
    } finally {
      setSubscribing(null)
    }
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

  const plan = getPlan(member.plan as MembershipPlan)
  const isMember = member.plan !== 'none'

  const tabs: {
    id: TabId
    label: string
    short: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number
  }[] = [
    { id: 'overview', label: fr ? "Vue d'ensemble" : 'Overview', short: fr ? 'Aperçu' : 'Overview', icon: LayoutGrid },
    { id: 'membership', label: fr ? 'Abonnement' : 'Membership', short: fr ? 'Abonnement' : 'Membership', icon: Sparkles },
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
          {isMember && (
            <span className="hidden items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent ring-1 ring-accent/20 sm:inline-flex">
              <Ticket className="size-3.5" aria-hidden /> {member.credits} {fr ? 'crédits' : 'credits'}
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
          {/* ───────── VUE D'ENSEMBLE ───────── */}
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              {isMember ? (
                <div className="overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.08] via-card to-card">
                  <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1.1fr_1fr] md:items-center">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent ring-1 ring-accent/20">
                        <Sparkles className="size-3.5" aria-hidden /> {fr ? 'Membre' : 'Member'} {plan.name[locale]}
                      </span>
                      <div className="mt-4 flex items-end gap-3">
                        <span className="font-editorial text-6xl font-normal leading-none text-foreground">{member.credits}</span>
                        <span className="mb-1 text-sm text-muted-foreground">
                          {fr ? 'crédits disponibles' : 'credits available'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <Ticket className="mr-1 inline size-3.5 text-accent" aria-hidden />
                        {fr ? '1 crédit = 1 heure de réservation' : '1 credit = 1 hour of booking'}
                      </p>
                      {!member.creditsValid && (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          {fr ? 'Vos crédits ont expiré — pensez à renouveler.' : 'Your credits have expired — please renew.'}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-background/60 p-4">
                      <MiniStat icon={BadgePercent} value={`${Math.round(plan.discountRate * 100)}%`} label={fr ? 'de remise' : 'discount'} />
                      <MiniStat icon={CalendarClock} value={`${plan.advanceDays} ${fr ? 'j' : 'd'}`} label={fr ? "à l'avance" : 'ahead'} />
                      <MiniStat icon={RefreshCw} value={fmtDate(member.renewAt).split(' ').slice(0, 2).join(' ')} label={fr ? 'renouvellement' : 'renewal'} small />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.08] to-card p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="max-w-xl">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent ring-1 ring-accent/20">
                        <Sparkles className="size-3.5" aria-hidden /> {fr ? 'Devenez membre' : 'Become a member'}
                      </span>
                      <h2 className="mt-3 font-editorial text-2xl font-normal text-foreground sm:text-3xl">
                        {fr ? 'Débloquez vos avantages membres' : 'Unlock your member benefits'}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {fr
                          ? 'Choisissez une formule pour recevoir vos crédits mensuels, profiter de remises automatiques et réserver jusqu’à 10 jours à l’avance.'
                          : 'Choose a plan to get monthly credits, automatic discounts and book up to 10 days ahead.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setTab('membership')}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.5)] transition-all hover:brightness-105"
                    >
                      {fr ? 'Voir les formules' : 'See the plans'}
                      <ArrowRight className="size-4" aria-hidden />
                    </button>
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
                    { icon: Ticket, title: fr ? 'Des crédits chaque mois' : 'Monthly credits', text: fr ? 'Votre abonnement vous donne des crédits (1 crédit = 1 h).' : 'Your plan gives you credits (1 credit = 1 hour).' },
                    { icon: CalendarCheck, title: fr ? 'Réservez, c’est déduit' : 'Book, it’s deducted', text: fr ? 'Les crédits et la remise s’appliquent automatiquement.' : 'Credits and your discount apply automatically.' },
                    { icon: RefreshCw, title: fr ? 'Renouvellement mensuel' : 'Monthly renewal', text: fr ? 'Les crédits non utilisés sont perdus à la date de renouvellement.' : 'Unused credits are lost on the renewal date.' },
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
                    ? 'Prêt à jouer ? Vos crédits et remises sont appliqués automatiquement à la réservation.'
                    : 'Ready to play? Your credits and discounts apply automatically at checkout.'}
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

          {/* ───────── ABONNEMENT ───────── */}
          {tab === 'membership' && (
            <motion.div
              key="membership"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              <h2 className="font-editorial text-2xl font-normal text-foreground">
                {isMember ? (fr ? 'Gérer mon abonnement' : 'Manage my membership') : (fr ? 'Choisissez votre formule' : 'Choose your plan')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {fr
                  ? 'Crédits mensuels, remise automatique et réservation anticipée. Changez de formule à tout moment.'
                  : 'Monthly credits, automatic discount and advance booking. Switch plans anytime.'}
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {PAID_PLANS.map((p) => {
                  const current = member.plan === p.id
                  const recommended = p.id === 'silver'
                  return (
                    <div
                      key={p.id}
                      className={`relative flex flex-col rounded-3xl border p-6 transition-colors ${
                        current ? 'border-accent bg-accent/[0.04] ring-1 ring-accent/30' : recommended ? 'border-ocean/30 bg-card' : 'border-border bg-card'
                      }`}
                    >
                      {recommended && !current && (
                        <span className="absolute -top-2.5 left-6 rounded-full bg-ocean px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          {fr ? 'Populaire' : 'Popular'}
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-editorial text-xl font-medium text-foreground">{p.name[locale]}</span>
                        {current && (
                          <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
                            {fr ? 'Actuel' : 'Current'}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 font-editorial text-3xl font-normal text-foreground">
                        {p.priceTHB.toLocaleString(fr ? 'fr-FR' : 'en-GB')} ฿
                        <span className="text-sm font-normal text-muted-foreground">{fr ? ' / mois' : ' / mo'}</span>
                      </p>
                      <ul className="mt-5 flex-1 space-y-2.5">
                        {p.perks.map((perk) => (
                          <li key={perk[locale]} className="flex items-start gap-2 text-sm text-foreground">
                            <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                            {perk[locale]}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => subscribe(p.id)}
                        disabled={current || subscribing !== null}
                        className={`mt-6 h-11 w-full rounded-full ${
                          current ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground hover:brightness-105'
                        }`}
                      >
                        {subscribing === p.id ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : current ? (
                          fr ? 'Formule active' : 'Active plan'
                        ) : isMember ? (
                          fr ? 'Passer à cette formule' : 'Switch to this plan'
                        ) : fr ? 'Choisir' : 'Choose'}
                      </Button>
                    </div>
                  )
                })}
              </div>
              {isMember && (
                <button
                  onClick={() => subscribe('none')}
                  disabled={subscribing !== null}
                  className="mt-4 text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                >
                  {fr ? 'Résilier mon abonnement' : 'Cancel my membership'}
                </button>
              )}
              <p className="mt-3 text-[11px] text-muted-foreground">
                {fr
                  ? '⚠️ Grille tarifaire provisoire — remplacée par la grille officielle au lancement.'
                  : '⚠️ Provisional pricing — replaced by the official grid at launch.'}
              </p>
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

function MiniStat({
  icon: Icon,
  value,
  label,
  small,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  small?: boolean
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon className="size-4 text-accent" aria-hidden />
      <span className={`mt-1.5 font-semibold text-foreground ${small ? 'text-xs' : 'text-sm'}`}>{value}</span>
      <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
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
