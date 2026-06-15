'use client'

import { CheckCheck, Eye, Globe, Mail, Search, Send, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ImageField } from '@/components/admin/field-editor'
import { Flag } from '@/components/flag'
import { COUNTRY_BY_ISO2 } from '@/lib/country-codes'
import { getDemoContacts } from '@/lib/demo-contacts'
import { renderNewsletter } from '@/lib/newsletter-template'
import { cn } from '@/lib/utils'

interface Contact {
  _id: string
  email: string
  name?: string
  phone?: string
  country?: string
  newsletterOptIn: boolean
  unsubscribedAt?: string | null
  createdAt: string
}

type Period = 'all' | '2m' | '6m' | '12m'
type Lang = 'fr' | 'en'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: 'Toutes dates' },
  { key: '2m', label: '2 derniers mois' },
  { key: '6m', label: '6 derniers mois' },
  { key: '12m', label: '12 derniers mois' },
]

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function cutoff(months: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default function AdminNewsletterPage() {
  const router = useRouter()
  const [all, setAll] = useState<Contact[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filtres
  const [subsOnly, setSubsOnly] = useState(true)
  const [country, setCountry] = useState('all')
  const [period, setPeriod] = useState<Period>('all')
  const [search, setSearch] = useState('')

  // Sélection + composition
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [lang, setLang] = useState<Lang>('fr')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [buttonLink, setButtonLink] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contacts?filter=all', { headers: authHeaders() })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      const real: Contact[] = data.contacts ?? []
      if (real.length === 0) {
        setAll(getDemoContacts() as unknown as Contact[])
        setIsDemo(true)
      } else {
        setAll(real)
        setIsDemo(false)
      }
    } catch {
      setAll(getDemoContacts() as unknown as Contact[])
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  // On ne propose JAMAIS les désinscrits (interdiction de les recontacter).
  const base = useMemo(() => all.filter((c) => c.email && !c.unsubscribedAt), [all])

  const countryOptions = useMemo(() => {
    const set = new Map<string, number>()
    for (const c of base) if (c.country) set.set(c.country, (set.get(c.country) || 0) + 1)
    return [...set.entries()]
      .map(([iso, n]) => ({ iso, name: COUNTRY_BY_ISO2[iso]?.name ?? iso, n }))
      .sort((a, b) => b.n - a.n)
  }, [base])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const cut = period === 'all' ? null : cutoff(period === '2m' ? 2 : period === '6m' ? 6 : 12)
    return base.filter((c) => {
      if (subsOnly && !c.newsletterOptIn) return false
      if (country !== 'all' && c.country !== country) return false
      if (cut && new Date(c.createdAt) < cut) return false
      if (q && !((c.name || '').toLowerCase().includes(q) || c.email.toLowerCase().includes(q))) return false
      return true
    })
  }, [base, subsOnly, country, period, search])

  const selectedFiltered = useMemo(() => filtered.filter((c) => selected.has(c.email)), [filtered, selected])
  const allFilteredSelected = filtered.length > 0 && selectedFiltered.length === filtered.length

  function toggle(email: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(email)) next.delete(email)
      else next.add(email)
      return next
    })
  }

  function toggleAllFiltered() {
    setSelected((s) => {
      const next = new Set(s)
      if (allFilteredSelected) filtered.forEach((c) => next.delete(c.email))
      else filtered.forEach((c) => next.add(c.email))
      return next
    })
  }

  async function send(test: boolean) {
    if (!subject.trim() || !message.trim()) {
      setResult({ ok: false, text: 'Renseignez l’objet et le message.' })
      return
    }
    const emails = [...selected]
    if (!test && emails.length === 0) {
      setResult({ ok: false, text: 'Sélectionnez au moins un destinataire.' })
      return
    }
    if (!test && !isDemo && !confirm(`Envoyer ce message à ${emails.length} destinataire(s) ?`)) return

    setSending(true)
    setResult(null)
    try {
      // En mode démo (aucun contact réel), on SIMULE l'envoi réel uniquement.
      // Le test, lui, part vraiment (pour vérifier la délivrabilité).
      if (isDemo && !test) {
        await new Promise((r) => setTimeout(r, 600))
        setResult({
          ok: true,
          text: `Simulation : ${emails.length} destinataire(s) — envoi non effectué (aucun contact réel pour le moment).`,
        })
        return
      }

      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body: message, lang, test, emails, imageUrl, buttonText, buttonLink, testEmail }),
      })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      if (res.status === 503 || data.error === 'email-not-configured') {
        setResult({ ok: false, text: 'Envoi d’emails non configuré (clé Resend manquante).' })
        return
      }
      if (!res.ok || data.ok === false) {
        setResult({ ok: false, text: `Échec de l’envoi${data.error ? ` : ${data.error}` : ''}.` })
        return
      }
      if (test) {
        setResult({ ok: true, text: `Email de test envoyé à ${data.to}.` })
      } else {
        const extra = data.skippedUnsub ? ` · ${data.skippedUnsub} désinscrit(s) ignoré(s)` : ''
        const cap = data.capped ? ` · ${data.capped} au-delà de la limite du jour` : ''
        setResult({ ok: true, text: `${data.sent} email(s) envoyé(s)${extra}${cap}.` })
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-3 pt-12 md:pt-0">
        <div>
          <h1 className="font-display text-2xl text-foreground">Newsletter</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Ciblez vos contacts (par pays, par date) et envoyez un message personnalisé.
            Les désinscrits sont automatiquement exclus.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* ── Destinataires ── */}
        <div className="space-y-3 lg:col-span-3">
          {/* Filtres */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={subsOnly}
                onChange={(e) => setSubsOnly(e.target.checked)}
                className="size-4 rounded border-input accent-accent"
              />
              Abonnés uniquement
            </label>

            <div className="relative">
              <Globe className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background/60 pl-8 pr-3 text-sm outline-none"
              >
                <option value="all">Tous les pays</option>
                {countryOptions.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.name} ({c.n})
                  </option>
                ))}
              </select>
            </div>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="h-9 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none"
            >
              {PERIODS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>

            <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-input bg-background/60 px-3 sm:min-w-[180px]">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Effacer">
                  <X className="size-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Barre de sélection */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
            <button onClick={toggleAllFiltered} className="inline-flex items-center gap-2 font-medium text-foreground hover:text-accent">
              <CheckCheck className="size-4" />
              {allFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
            <span className="text-muted-foreground">
              <span className="font-semibold text-accent">{selected.size}</span> sélectionné(s) · {filtered.length} affiché(s)
            </span>
          </div>

          {/* Liste */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="max-h-[460px] overflow-y-auto divide-y divide-border/60">
              {loading ? (
                <div className="px-4 py-12 text-center text-muted-foreground">Chargement…</div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-12 text-center text-muted-foreground">Aucun contact pour ces filtres.</div>
              ) : (
                filtered.map((c) => {
                  const checked = selected.has(c.email)
                  return (
                    <label
                      key={c._id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40',
                        checked && 'bg-accent/5'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(c.email)}
                        className="size-4 rounded border-input accent-accent"
                      />
                      {c.country && <Flag iso2={c.country} className="shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{c.name || c.email}</div>
                        <div className="truncate text-xs text-muted-foreground">{c.email}</div>
                      </div>
                      {c.newsletterOptIn ? (
                        <span className="hidden shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:inline dark:text-emerald-300">
                          Abonné
                        </span>
                      ) : (
                        <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:inline">Client</span>
                      )}
                      <span className="hidden shrink-0 text-xs text-muted-foreground md:inline">{fmtDate(c.createdAt)}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Composition ── */}
        <div className="lg:col-span-2">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-accent" />
              <h2 className="font-display text-lg text-foreground">Message</h2>
            </div>

            {/* Langue */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Langue</span>
              <div className="inline-flex w-full gap-1 rounded-xl border border-border bg-background/60 p-1">
                {(['fr', 'en'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      'flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
                      lang === l ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {l === 'fr' ? 'Français' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Objet</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={lang === 'en' ? 'A word from Shi Shi Samui' : 'Un mot de Shi Shi Samui'}
                className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                placeholder={
                  lang === 'en'
                    ? 'Hi {prenom},\n\nWe are happy to…'
                    : 'Bonjour {prenom},\n\nNous avons le plaisir de…'
                }
                className="w-full resize-y rounded-xl border border-input bg-background/60 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <p className="text-[11px] text-muted-foreground/70">
                Variables : <code className="rounded bg-muted px-1">{'{prenom}'}</code>{' '}
                <code className="rounded bg-muted px-1">{'{nom}'}</code> — personnalisées par destinataire.
              </p>
            </div>

            {/* Image (lien ou upload) */}
            <ImageField label="Image (optionnelle)" value={imageUrl} onChange={setImageUrl} />

            {/* Bouton-lien */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Texte du bouton</span>
                <input
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder={lang === 'en' ? 'Book now' : 'Réserver'}
                  className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lien du bouton</span>
                <input
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  placeholder="https://…"
                  className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </div>
            </div>

            {/* Email de test (sinon adresse de l'entreprise) */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email de test</span>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="ton@email.com (sinon adresse de l’entreprise)"
                className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>

            {result && (
              <p className={cn('rounded-lg px-3 py-2 text-sm', result.ok ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/10 text-red-600')}>
                {result.text}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setPreviewOpen(true)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Eye className="size-4" /> Aperçu
              </button>
              <button
                onClick={() => send(true)}
                disabled={sending}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
              >
                Test
              </button>
              <button
                onClick={() => send(false)}
                disabled={sending || selected.size === 0}
                className="inline-flex h-10 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:brightness-105 disabled:opacity-40"
              >
                <Send className="size-4" />
                {sending ? 'Envoi…' : `Envoyer (${selected.size})`}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              Le test part vers l’email de test ci-dessus (ou l’adresse de l’entreprise si vide). Limite ~100 envois/jour (plan Resend gratuit).
            </p>
          </div>
        </div>
      </div>

      {/* Aperçu de l'email (rendu identique à l'envoi réel) */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-display text-lg text-foreground">Aperçu de l’email</h2>
              <button onClick={() => setPreviewOpen(false)} className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>
            <iframe
              title="Aperçu de l'email"
              className="h-[70vh] w-full bg-[#f4f4f5]"
              srcDoc={renderNewsletter({
                body: message || (lang === 'en' ? 'Hi {prenom},\n\nYour message…' : 'Bonjour {prenom},\n\nVotre message…'),
                lang,
                imageUrl: imageUrl || undefined,
                buttonText: buttonText || undefined,
                buttonLink: buttonLink || undefined,
                name: selectedFiltered[0]?.name || filtered[0]?.name || 'Camille',
                unsubUrl: '#',
              })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
