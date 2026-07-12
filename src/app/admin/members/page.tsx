'use client'

import {
  CalendarClock,
  Check,
  ChevronDown,
  CreditCard,
  Loader2,
  Plus,
  RefreshCw,
  Repeat,
  Search,
  Ticket,
  X,
} from 'lucide-react'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'

import { activities } from '@/lib/activities'
import { isBookable } from '@/lib/availability'
import { cn } from '@/lib/utils'

/** Activités pouvant recevoir des crédits (celles réservables en ligne). */
const CREDIT_ACTIVITIES: { slug: string; label: string }[] = activities
  .filter((a) => isBookable(a.slug))
  .map((a) => ({ slug: a.slug, label: a.name.fr }))

const activityLabel = (slug: string) =>
  CREDIT_ACTIVITIES.find((a) => a.slug === slug)?.label ?? slug

/** Solde courant d'un portefeuille de crédits propre à une activité. */
interface ActivityCredit {
  activity: string
  credits: number
  /** Recharge automatique mensuelle (0 = crédits ponctuels valables 1 mois). */
  monthly: number
  renewAt: string | null
}

/** Abonnement du catalogue actuellement appliqué au membre. */
interface MemberSubscription {
  name: string
  priceTHB: number
  startedAt: string | null
}

interface Member {
  id: string
  email: string
  name: string
  phone: string
  /** Crédits par activité (tennis, fitness…) — seul système d'avantages. */
  activityCredits: ActivityCredit[]
  /** Abonnement du catalogue appliqué (null si aucun). */
  subscription: MemberSubscription | null
  memberSince: string | null
  createdAt: string
  bookingsCount: number
}

/** Option d'abonnement (catalogue) proposable à l'application. */
interface PlanOption {
  id: string
  name: string
  priceTHB: number
  active: boolean
}

type Filter = 'all' | 'credits' | 'auto' | 'nocredits'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'credits', label: 'Avec crédits' },
  { key: 'auto', label: 'Recharge auto' },
  { key: 'nocredits', label: 'Sans crédits' },
]

function authHeaders(json = false): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const h: Record<string, string> = {}
  if (token) h.Authorization = `Bearer ${token}`
  if (json) h['Content-Type'] = 'application/json'
  return h
}

function fmtDate(s?: string | null): string {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [counts, setCounts] = useState({ all: 0, credits: 0, auto: 0, nocredits: 0 })
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  // Ligne dépliée : éditeur des crédits par activité du membre.
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Catalogue d'abonnements proposables (pour l'application en 1 clic).
  useEffect(() => {
    fetch('/api/subscription-plans', { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setPlans((d.plans as PlanOption[]).filter((p) => p.active)))
      .catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/members?filter=${filter}&q=${encodeURIComponent(q)}`, {
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur de chargement')
        return
      }
      setMembers(data.members)
      setCounts(data.counts)
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [filter, q])

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(load, q ? 300 : 0)
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [load, q])

  /** PATCH générique d'un membre (crédits, application/résiliation d'abonnement). */
  async function patchMember(id: string, body: Record<string, unknown>) {
    setSavingId(id)
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PATCH',
        headers: authHeaders(true),
        body: JSON.stringify(body),
      })
      if (res.ok) await load()
      else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Échec de la mise à jour')
      }
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <Ticket className="size-6 text-accent" /> Adhérents &amp; crédits
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Le client paie sur place, vous le créditez ici. Chaque crédit est propre à une activité
            (1 crédit = 1 h ou 1 accès) : un crédit tennis ne sert que pour le tennis.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} /> Actualiser
        </button>
      </div>

      {/* Stats rapides */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Adhérents" value={counts.all} />
        <StatCard label="Avec crédits" value={counts.credits} accent />
        <StatCard label="Recharge auto" value={counts.auto} />
        <StatCard label="Sans crédits" value={counts.nocredits} />
      </div>

      {/* Onglets + recherche */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                filter === f.key ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (nom, email, téléphone)"
            className="h-10 w-64 rounded-lg border border-input bg-background pl-9 pr-8 text-sm focus:border-accent focus:outline-none"
          />
          {q && (
            <button onClick={() => setQ('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Tableau */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Adhérent</th>
                <th className="px-4 py-3">Crédits par activité</th>
                <th className="px-4 py-3">Réservations</th>
                <th className="px-4 py-3">Adhérent depuis</th>
                <th className="px-4 py-3 text-right">Gérer</th>
              </tr>
            </thead>
            <tbody>
              {loading && members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Aucun adhérent pour ce filtre.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const open = expandedId === m.id
                  return (
                    <Fragment key={m.id}>
                      <tr
                        onClick={() => setExpandedId(open ? null : m.id)}
                        className={cn(
                          'cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30',
                          open && 'bg-muted/20'
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{m.name || '—'}</div>
                          <div className="text-xs text-muted-foreground">{m.email}</div>
                          {m.phone && <div className="text-xs text-muted-foreground">{m.phone}</div>}
                          {m.subscription && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-ocean/10 px-2 py-0.5 text-[11px] font-semibold text-ocean">
                              <CreditCard className="size-3" /> {m.subscription.name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {m.activityCredits.length === 0 ? (
                            <span className="text-xs text-muted-foreground">Aucun crédit</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {m.activityCredits.map((w) => (
                                <span
                                  key={w.activity}
                                  title={
                                    w.monthly > 0
                                      ? `Recharge automatique : ${w.monthly}/mois`
                                      : w.renewAt
                                        ? `Valables jusqu'au ${fmtDate(w.renewAt)}`
                                        : undefined
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent ring-1 ring-accent/15"
                                >
                                  <Ticket className="size-3" />
                                  {activityLabel(w.activity)}
                                  <span className="tabular-nums">{w.credits}</span>
                                  {w.monthly > 0 && <Repeat className="size-3 opacity-70" aria-label="Recharge auto" />}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-foreground">{m.bookingsCount}</td>
                        <td className="px-4 py-3 text-muted-foreground">{fmtDate(m.memberSince)}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 text-xs font-semibold',
                              open ? 'text-accent' : 'text-muted-foreground'
                            )}
                          >
                            Crédits
                            <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
                          </span>
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-b border-border/60 bg-muted/20 last:border-0">
                          <td colSpan={5} className="px-4 py-4">
                            <ActivityCreditsPanel
                              member={m}
                              plans={plans}
                              saving={savingId === m.id}
                              onCredit={(activity, payload) =>
                                patchMember(m.id, { activityCredits: { activity, ...payload } })
                              }
                              onApplyPlan={(planId) => patchMember(m.id, { subscriptionPlanId: planId })}
                              onCancelPlan={() => patchMember(m.id, { action: 'cancel-subscription' })}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/**
 * Éditeur d'un membre : abonnement (catalogue) en haut, puis crédits par
 * activité (ajout ponctuel + recharge auto).
 */
function ActivityCreditsPanel({
  member,
  plans,
  saving,
  onCredit,
  onApplyPlan,
  onCancelPlan,
}: {
  member: Member
  plans: PlanOption[]
  saving: boolean
  onCredit: (activity: string, payload: Record<string, number>) => void
  onApplyPlan: (planId: string) => void
  onCancelPlan: () => void
}) {
  const [planId, setPlanId] = useState('')

  return (
    <div className="space-y-3">
      {/* Abonnement : appliquer en 1 clic → met en place la recharge auto */}
      <div className="rounded-xl border border-border bg-card p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CreditCard className="size-4 text-accent" /> Abonnement
            </p>
            {member.subscription ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Actuel : <span className="font-semibold text-ocean">{member.subscription.name}</span>
                {member.subscription.priceTHB > 0
                  ? ` · ${member.subscription.priceTHB.toLocaleString('fr-FR')} ฿/mois`
                  : ''}
                {member.subscription.startedAt ? ` · depuis le ${fmtDate(member.subscription.startedAt)}` : ''}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Aucun. En appliquer un met en place la recharge auto correspondante.
              </p>
            )}
          </div>
          {member.subscription && (
            <button
              onClick={onCancelPlan}
              disabled={saving}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              Résilier
            </button>
          )}
        </div>

        {plans.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="h-9 min-w-[160px] flex-1 rounded-md border border-input bg-background px-2 text-sm focus:border-accent focus:outline-none"
            >
              <option value="">Choisir un abonnement…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.priceTHB > 0 ? ` — ${p.priceTHB.toLocaleString('fr-FR')} ฿/mois` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={() => planId && onApplyPlan(planId)}
              disabled={saving || !planId}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground transition-all hover:brightness-105 disabled:opacity-40"
            >
              <Check className="size-3.5" /> Appliquer
            </button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Aucun abonnement au catalogue.{' '}
            <a href="/admin/subscriptions" className="font-medium text-accent hover:underline">
              Créez-en un
            </a>
            .
          </p>
        )}
      </div>

      {/* Crédits par activité */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-sm font-semibold text-foreground">Crédits par activité</p>
        {saving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>
      <div className="grid gap-2.5 lg:grid-cols-2">
        {CREDIT_ACTIVITIES.map((a) => (
          <ActivityCreditCard
            key={a.slug}
            label={a.label}
            wallet={member.activityCredits.find((w) => w.activity === a.slug)}
            saving={saving}
            onAdd={(n) => onCredit(a.slug, { add: n })}
            onMonthly={(n) => onCredit(a.slug, { monthly: n })}
          />
        ))}
      </div>
    </div>
  )
}

/** Carte d'une activité : solde bien lisible + les deux gestes de crédit. */
function ActivityCreditCard({
  label,
  wallet,
  saving,
  onAdd,
  onMonthly,
}: {
  label: string
  wallet?: ActivityCredit
  saving: boolean
  onAdd: (n: number) => void
  onMonthly: (n: number) => void
}) {
  const [add, setAdd] = useState('')
  const [monthly, setMonthly] = useState(String(wallet?.monthly ?? 0))

  // Resynchronise la recharge auto après un enregistrement / rechargement.
  useEffect(() => {
    setMonthly(String(wallet?.monthly ?? 0))
  }, [wallet?.monthly])

  const credits = wallet?.credits ?? 0
  const auto = wallet?.monthly ?? 0
  const monthlyDirty = Math.max(0, Math.floor(Number(monthly) || 0)) !== auto
  const inputCls =
    'h-9 w-16 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus:border-accent focus:outline-none'

  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      {/* Solde : l'information principale, impossible à rater */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={cn(
                'text-2xl font-bold tabular-nums leading-none',
                credits > 0 ? 'text-accent' : 'text-muted-foreground/50'
              )}
            >
              {credits}
            </span>
            <span className="text-xs text-muted-foreground">crédit{credits > 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          {auto > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ocean/10 px-2 py-0.5 text-[11px] font-semibold text-ocean">
              <Repeat className="size-3" /> {auto}/mois auto
            </span>
          ) : credits > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <CalendarClock className="size-3" /> ponctuel
            </span>
          ) : null}
          {credits > 0 && wallet?.renewAt && (
            <span className="text-[11px] text-muted-foreground">
              {auto > 0 ? 'recharge le' : "jusqu'au"} {fmtDate(wallet.renewAt)}
            </span>
          )}
        </div>
      </div>

      {/* Les deux gestes, étiquetés sans ambiguïté */}
      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Ajout ponctuel
          </label>
          <p className="text-[11px] text-muted-foreground">Valable 1 mois</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              placeholder="0"
              value={add}
              onChange={(e) => setAdd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && Number(add) > 0) {
                  onAdd(Math.floor(Number(add)))
                  setAdd('')
                }
              }}
              className={inputCls}
              aria-label={`Crédits ${label} à ajouter (valables 1 mois)`}
            />
            <button
              onClick={() => {
                const n = Math.floor(Number(add))
                if (n > 0) {
                  onAdd(n)
                  setAdd('')
                }
              }}
              disabled={saving || !(Number(add) > 0)}
              className="inline-flex h-9 items-center gap-1 rounded-md bg-accent px-2.5 text-xs font-semibold text-accent-foreground transition-all hover:brightness-105 disabled:opacity-40"
            >
              <Plus className="size-3.5" /> Ajouter
            </button>
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Recharge auto
          </label>
          <p className="text-[11px] text-muted-foreground">Chaque mois (0 = off)</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && monthlyDirty) {
                  onMonthly(Math.max(0, Math.floor(Number(monthly) || 0)))
                }
              }}
              className={inputCls}
              aria-label={`Crédits ${label} automatiques par mois`}
            />
            <button
              onClick={() => onMonthly(Math.max(0, Math.floor(Number(monthly) || 0)))}
              disabled={saving || !monthlyDirty}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Check className="size-3.5" /> OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        accent ? 'border-accent/30 bg-accent/[0.06]' : 'border-border bg-card'
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  )
}
