'use client'

import { CreditCard, Loader2, Pencil, Plus, RefreshCw, Ticket, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { activities } from '@/lib/activities'
import { isBookable } from '@/lib/availability'
import { cn } from '@/lib/utils'

/** Activités pouvant recevoir des crédits (celles réservables en ligne). */
const CREDIT_ACTIVITIES: { slug: string; label: string }[] = activities
  .filter((a) => isBookable(a.slug))
  .map((a) => ({ slug: a.slug, label: a.name.fr }))

const activityLabel = (slug: string) => CREDIT_ACTIVITIES.find((a) => a.slug === slug)?.label ?? slug

interface PlanCredit {
  activity: string
  monthly: number
}
interface Plan {
  id: string
  name: string
  priceTHB: number
  /** Total de crédits mensuels inclus (plafond réparti entre les activités). */
  monthlyTotal: number
  credits: PlanCredit[]
  active: boolean
}

function authHeaders(json = false): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  const h: Record<string, string> = {}
  if (token) h.Authorization = `Bearer ${token}`
  if (json) h['Content-Type'] = 'application/json'
  return h
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Plan | 'new' | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscription-plans', { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur de chargement')
        return
      }
      setPlans(data.plans)
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function remove(id: string) {
    if (!confirm('Supprimer cet abonnement du catalogue ?')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/subscription-plans/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (res.ok) setPlans((ps) => ps.filter((p) => p.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  async function toggleActive(p: Plan) {
    setBusyId(p.id)
    try {
      const res = await fetch(`/api/subscription-plans/${p.id}`, {
        method: 'PATCH',
        headers: authHeaders(true),
        body: JSON.stringify({ active: !p.active }),
      })
      if (res.ok) {
        const data = await res.json()
        setPlans((ps) => ps.map((x) => (x.id === p.id ? data.plan : x)))
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <CreditCard className="size-6 text-accent" /> Abonnements
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Votre catalogue d'abonnements. Créez-les ici, puis appliquez-les à un membre en 1 clic depuis
            la page <span className="font-medium text-foreground">Membres</span> : les crédits mensuels
            par activité se mettent en place automatiquement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing('new')}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
          >
            <Plus className="size-4" /> Nouvel abonnement
          </button>
          <button
            onClick={load}
            aria-label="Actualiser"
            className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted"
          >
            <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Liste */}
      <div className="mt-6">
        {loading && plans.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-16 text-center text-muted-foreground">
            <Loader2 className="mx-auto size-5 animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <Ticket className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-foreground">Aucun abonnement pour le moment</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Créez votre premier abonnement (ex. « Tennis illimité », 8 crédits tennis / mois).
            </p>
            <button
              onClick={() => setEditing('new')}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
            >
              <Plus className="size-4" /> Nouvel abonnement
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {plans.map((p) => {
              // Crédits réellement octroyés = somme répartie (le total peut être ≥).
              const granted = p.credits.reduce((s, c) => s + c.monthly, 0)
              return (
              <div
                key={p.id}
                className={cn(
                  'flex flex-col rounded-2xl border bg-card p-5',
                  p.active ? 'border-border' : 'border-border/60 opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg text-foreground">{p.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {p.priceTHB > 0 ? `${p.priceTHB.toLocaleString('fr-FR')} ฿ / mois · ` : ''}
                      {granted} crédit{granted > 1 ? 's' : ''} / mois
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditing(p)}
                      aria-label="Modifier"
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      disabled={busyId === p.id}
                      aria-label="Supprimer"
                      className="flex size-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.credits.map((c) => (
                    <span
                      key={c.activity}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent ring-1 ring-accent/15"
                    >
                      <Ticket className="size-3" />
                      {activityLabel(c.activity)} · {c.monthly}/mois
                    </span>
                  ))}
                </div>

                <label className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={() => toggleActive(p)}
                    disabled={busyId === p.id}
                    className="size-4 rounded border-input accent-accent"
                  />
                  Proposable (visible pour l'application aux membres)
                </label>
              </div>
              )
            })}
          </div>
        )}
      </div>

      {editing && (
        <PlanEditor
          plan={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setPlans((ps) => {
              const exists = ps.some((p) => p.id === saved.id)
              return exists ? ps.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...ps]
            })
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

/** Modale de création / édition d'un abonnement. */
function PlanEditor({
  plan,
  onClose,
  onSaved,
}: {
  plan: Plan | null
  onClose: () => void
  onSaved: (p: Plan) => void
}) {
  const [name, setName] = useState(plan?.name ?? '')
  const [priceTHB, setPriceTHB] = useState(String(plan?.priceTHB ?? ''))
  // Total de crédits/mois inclus : « budget » à répartir entre les activités.
  const [monthlyTotal, setMonthlyTotal] = useState(String(plan?.monthlyTotal ?? ''))
  // Crédits mensuels par activité (0 = activité non incluse).
  const [credits, setCredits] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const a of CREDIT_ACTIVITIES) {
      const found = plan?.credits.find((c) => c.activity === a.slug)
      map[a.slug] = found ? String(found.monthly) : ''
    }
    return map
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const creditList = CREDIT_ACTIVITIES.map((a) => ({
    activity: a.slug,
    monthly: Math.max(0, Math.floor(Number(credits[a.slug]) || 0)),
  })).filter((c) => c.monthly > 0)

  // Budget mensuel + répartition courante (pour plafonner et informer).
  const total = Math.max(0, Math.floor(Number(monthlyTotal) || 0))
  const distributed = creditList.reduce((s, c) => s + c.monthly, 0)
  const remaining = total - distributed
  const over = total > 0 && distributed > total

  /** Saisie d'une activité, plafonnée au budget restant (« 4 max »). */
  function setActivity(slug: string, value: string) {
    if (value === '') {
      setCredits((m) => ({ ...m, [slug]: '' }))
      return
    }
    const raw = Math.max(0, Math.floor(Number(value) || 0))
    setCredits((m) => {
      if (total > 0) {
        const others = CREDIT_ACTIVITIES.reduce(
          (s, a) => (a.slug === slug ? s : s + Math.max(0, Math.floor(Number(m[a.slug]) || 0))),
          0
        )
        const capped = Math.min(raw, Math.max(0, total - others))
        return { ...m, [slug]: capped > 0 ? String(capped) : '' }
      }
      return { ...m, [slug]: String(raw) }
    })
  }

  /** Change du budget total : re-plafonne la répartition pour ne jamais le dépasser. */
  function setTotal(value: string) {
    setMonthlyTotal(value)
    const t = Math.max(0, Math.floor(Number(value) || 0))
    if (t <= 0) return // pas de plafond tant qu'aucun total n'est fixé
    setCredits((m) => {
      let budget = t
      const next: Record<string, string> = {}
      for (const a of CREDIT_ACTIVITIES) {
        const v = Math.max(0, Math.floor(Number(m[a.slug]) || 0))
        const keep = Math.min(v, budget)
        budget -= keep
        next[a.slug] = keep > 0 ? String(keep) : ''
      }
      return next
    })
  }

  async function submit() {
    if (!name.trim()) {
      setError('Donnez un nom à l’abonnement.')
      return
    }
    if (creditList.length === 0) {
      setError('Ajoutez au moins une activité avec des crédits mensuels.')
      return
    }
    if (over) {
      setError(`La répartition (${distributed}) dépasse le total de crédits (${total}).`)
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: name.trim(),
        priceTHB: Math.max(0, Math.floor(Number(priceTHB) || 0)),
        monthlyTotal: total,
        credits: creditList,
      }
      const res = await fetch(plan ? `/api/subscription-plans/${plan.id}` : '/api/subscription-plans', {
        method: plan ? 'PATCH' : 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Échec de l’enregistrement')
        return
      }
      onSaved(data.plan)
    } finally {
      setSaving(false)
    }
  }

  const fieldCls =
    'h-11 w-full rounded-xl border border-input bg-background/70 px-3 text-sm outline-none focus-visible:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)]'

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">
            {plan ? 'Modifier l’abonnement' : 'Nouvel abonnement'}
          </h2>
          <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nom</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Tennis illimité" className={fieldCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prix mensuel (฿, indicatif)</label>
              <input
                value={priceTHB}
                onChange={(e) => setPriceTHB(e.target.value)}
                type="number"
                min={0}
                placeholder="0"
                className={fieldCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Crédits inclus / mois (total)</label>
              <input
                value={monthlyTotal}
                onChange={(e) => setTotal(e.target.value)}
                type="number"
                min={0}
                placeholder="Ex. 4"
                className={fieldCls}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Répartition par activité
              </label>
              {total > 0 && (
                <span
                  className={cn(
                    'text-xs font-medium tabular-nums',
                    over ? 'text-red-600' : remaining === 0 ? 'text-emerald-600' : 'text-muted-foreground'
                  )}
                >
                  {distributed} / {total} répartis
                  {over
                    ? ` · dépassement de ${distributed - total}`
                    : remaining > 0
                      ? ` · reste ${remaining}`
                      : ' ✓'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              1 crédit = 1 h (ou 1 accès).{' '}
              {total > 0
                ? 'La somme est plafonnée au total défini ci-dessus.'
                : 'Fixez un total ci-dessus pour plafonner la répartition.'}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {CREDIT_ACTIVITIES.map((a) => {
                const current = Math.max(0, Math.floor(Number(credits[a.slug]) || 0))
                const maxForThis = total > 0 ? current + Math.max(0, remaining) : undefined
                return (
                  <div key={a.slug} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background/50 px-3 py-2">
                    <span className="text-sm font-medium text-foreground">{a.label}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={maxForThis}
                        value={credits[a.slug]}
                        onChange={(e) => setActivity(a.slug, e.target.value)}
                        placeholder="0"
                        className="h-9 w-16 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus:border-accent focus:outline-none"
                      />
                      <span className="text-xs text-muted-foreground">/mois</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="h-10 rounded-xl border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted">
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={saving || over}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground hover:brightness-105 disabled:opacity-40"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {plan ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}
