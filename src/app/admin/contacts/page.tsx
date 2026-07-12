'use client'

import {
  BarChart3,
  Check,
  Download,
  Mail,
  MailX,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { CrmStats } from '@/components/admin/crm-stats'
import { Flag } from '@/components/flag'
import { COUNTRIES_ORDERED, COUNTRY_BY_ISO2 } from '@/lib/country-codes'
import { getDemoContacts } from '@/lib/demo-contacts'
import { cn } from '@/lib/utils'

interface Contact {
  _id: string
  email: string
  name?: string
  phone?: string
  country?: string
  source: string[]
  tags: string[]
  newsletterOptIn: boolean
  unsubscribedAt?: string | null
  lastBookingAt?: string | null
  bookingsCount: number
  notes?: string
  createdAt: string
  updatedAt: string
}

type Filter = 'all' | 'members' | 'optin' | 'unsub'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tous les clients' },
  { key: 'members', label: 'Adhérents' },
  { key: 'optin', label: 'Abonnés newsletter' },
  { key: 'unsub', label: 'Désinscrits' },
]

const SOURCE_LABEL: Record<string, string> = {
  booking: 'Réservation',
  'contact-form': 'Contact',
  newsletter: 'Newsletter',
  manual: 'Ajout manuel',
  import: 'Import',
  member: 'Espace adhérent',
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function fmtDate(s?: string | null): string {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function matchesFilter(c: Contact, f: Filter): boolean {
  if (f === 'members') return (c.source || []).includes('member')
  if (f === 'optin') return c.newsletterOptIn && !c.unsubscribedAt
  if (f === 'unsub') return !!c.unsubscribedAt
  return true
}

/**
 * Adhérent = contact rattaché à un compte de l'espace adhérent (source « member »).
 * Les clients qui réservent SANS compte (« de passage ») n'ont pas ce tag.
 */
function isMember(c: Contact): boolean {
  return (c.source || []).includes('member')
}

/** Mini sticker « adhérent » posé à côté du nom des titulaires d'un compte. */
function MemberSticker() {
  return (
    <span
      title="Adhérent — titulaire d'un compte espace adhérent"
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-700 dark:text-amber-300"
    >
      <Star className="size-2.5 fill-current" /> Adhérent
    </span>
  )
}

/** Pastille de statut newsletter (réutilisée table + cartes). */
function NlBadge({ contact }: { contact: Contact }) {
  if (contact.unsubscribedAt) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500">
        <MailX className="size-3" /> Désinscrit
      </span>
    )
  }
  if (contact.newsletterOptIn) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
        <Check className="size-3" /> Abonné
      </span>
    )
  }
  return <span className="text-[11px] text-muted-foreground">Non abonné</span>
}

export default function AdminContactsPage() {
  const router = useRouter()
  const [all, setAll] = useState<Contact[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [view, setView] = useState<'clients' | 'stats'>('clients')
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contacts?filter=all', { headers: authHeaders() })
      if (res.status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      const real: Contact[] = data.contacts ?? []
      if (real.length === 0) {
        setAll(getDemoContacts() as Contact[])
        setIsDemo(true)
      } else {
        setAll(real)
        setIsDemo(false)
      }
    } catch (err) {
      console.error('Failed to load contacts:', err)
      // Hors-ligne / erreur : on montre quand même la démo pour se projeter.
      setAll(getDemoContacts() as Contact[])
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  // Compteurs + table filtrés côté client (recherche instantanée).
  const counts = useMemo(
    () => ({
      all: all.length,
      members: all.filter((c) => matchesFilter(c, 'members')).length,
      optin: all.filter((c) => matchesFilter(c, 'optin')).length,
      unsub: all.filter((c) => matchesFilter(c, 'unsub')).length,
    }),
    [all]
  )

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((c) => {
      if (!matchesFilter(c, filter)) return false
      if (!q) return true
      return (
        (c.name || '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      )
    })
  }, [all, filter, query])

  // Applique une modification à un contact (API si réel, local si démo).
  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id)
    try {
      if (isDemo) {
        applyLocalPatch(id, body)
      } else {
        const res = await fetch(`/api/contacts/${id}`, {
          method: 'PATCH',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (res.ok && data.contact) {
          setAll((cs) => cs.map((c) => (c._id === id ? data.contact : c)))
          setSelected((s) => (s && s._id === id ? data.contact : s))
        }
      }
    } finally {
      setBusyId(null)
    }
  }

  function applyLocalPatch(id: string, body: Record<string, unknown>) {
    setAll((cs) =>
      cs.map((c) => {
        if (c._id !== id) return c
        const next = { ...c }
        if ('newsletterOptIn' in body) next.newsletterOptIn = !!body.newsletterOptIn
        if ('unsubscribed' in body) {
          next.unsubscribedAt = body.unsubscribed ? new Date().toISOString() : null
          if (body.unsubscribed) next.newsletterOptIn = false
        }
        if ('tags' in body) next.tags = body.tags as string[]
        if ('notes' in body) next.notes = body.notes as string
        return next
      })
    )
    setSelected((s) => {
      if (!s || s._id !== id) return s
      const next = { ...s }
      if ('newsletterOptIn' in body) next.newsletterOptIn = !!body.newsletterOptIn
      if ('unsubscribed' in body) {
        next.unsubscribedAt = body.unsubscribed ? new Date().toISOString() : null
        if (body.unsubscribed) next.newsletterOptIn = false
      }
      if ('tags' in body) next.tags = body.tags as string[]
      if ('notes' in body) next.notes = body.notes as string
      return next
    })
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce contact ? (RGPD : effacement définitif)')) return
    setBusyId(id)
    try {
      if (!isDemo) {
        const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE', headers: authHeaders() })
        if (!res.ok) return
      }
      setAll((cs) => cs.filter((c) => c._id !== id))
      setSelected((s) => (s && s._id === id ? null : s))
    } finally {
      setBusyId(null)
    }
  }

  // Création d'un contact (API si réel, local si démo). Renvoie true si OK.
  async function createContact(payload: {
    email: string
    name?: string
    phone?: string
    country: string
    optIn: boolean
  }): Promise<boolean> {
    if (isDemo) {
      const now = new Date().toISOString()
      setAll((cs) => [
        {
          _id: `demo-new-${cs.length + 1}`,
          email: payload.email,
          name: payload.name,
          phone: payload.phone,
          country: payload.country,
          source: ['manual'],
          tags: [],
          newsletterOptIn: payload.optIn,
          unsubscribedAt: null,
          lastBookingAt: null,
          bookingsCount: 0,
          createdAt: now,
          updatedAt: now,
        },
        ...cs,
      ])
      return true
    }
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      await load()
      return true
    }
    return false
  }

  function exportCsv() {
    if (isDemo) {
      const header = ['Nom', 'Email', 'Téléphone', 'Pays', 'Newsletter', 'Réservations', 'Créé le']
      const rows = all.map((c) => [
        c.name || '',
        c.email,
        c.phone || '',
        c.country ? COUNTRY_BY_ISO2[c.country]?.name || c.country : '',
        c.unsubscribedAt ? 'Désinscrit' : c.newsletterOptIn ? 'Abonné' : 'Non',
        String(c.bookingsCount),
        fmtDate(c.createdAt),
      ])
      const csv = [header, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n')
      downloadBlob(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' }))
      return
    }
    fetch('/api/contacts/export', { headers: authHeaders() })
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => blob && downloadBlob(blob))
  }

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts-shishi-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-3 pt-12 md:pt-0">
        <div>
          <h1 className="font-display text-2xl text-foreground">CRM</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Tous vos clients. L’étoile <span className="font-medium text-amber-600 dark:text-amber-400">Adhérent</span> marque
            les titulaires d’un compte espace adhérent ; les clients de passage n’ont aucun tag.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-3 text-sm font-semibold text-accent-foreground transition-colors hover:brightness-105 sm:px-4"
          >
            <UserPlus className="size-4" /> <span className="hidden sm:inline">Ajouter</span>
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:px-4"
          >
            <Download className="size-4" /> <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={load}
            aria-label="Rafraîchir"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted"
          >
            <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Onglets : Clients (prioritaire) / Statistiques */}
      <div className="inline-flex w-full gap-1 rounded-xl border border-border bg-card p-1 sm:w-auto">
        <button
          onClick={() => setView('clients')}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:flex-none',
            view === 'clients' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="size-4" /> Clients
          <span className="text-xs opacity-70">{counts.all}</span>
        </button>
        <button
          onClick={() => setView('stats')}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:flex-none',
            view === 'stats' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <BarChart3 className="size-4" /> Statistiques
        </button>
      </div>

      {view === 'stats' ? (
        <CrmStats contacts={all} />
      ) : (
        <>
          {/* Barre d'outils : filtres + recherche */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 scrollbar-hide">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    filter === f.key ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f.label}
                  <span className="ml-1.5 text-xs opacity-70">{counts[f.key]}</span>
                </button>
              ))}
            </div>
            <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 sm:min-w-[220px]">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher (nom, email, téléphone)…"
                className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Effacer">
                  <X className="size-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Tableau (desktop) */}
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Newsletter</th>
                    <th className="px-4 py-3">Résa</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        Chargement…
                      </td>
                    </tr>
                  ) : displayed.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        Aucun contact pour ce filtre.
                      </td>
                    </tr>
                  ) : (
                    displayed.map((c) => (
                      <tr
                        key={c._id}
                        onClick={() => setSelected(c)}
                        className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{c.name || '—'}</span>
                            {isMember(c) && <MemberSticker />}
                          </div>
                          <div className="text-xs text-muted-foreground">{c.email}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                          {c.phone ? (
                            <span className="inline-flex items-center gap-1.5">
                              {c.country && <Flag iso2={c.country} />}
                              {c.phone}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <NlBadge contact={c} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.bookingsCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(c.source || []).map((s) => (
                              <span key={s} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {SOURCE_LABEL[s] || s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              remove(c._id)
                            }}
                            disabled={busyId === c._id}
                            aria-label="Supprimer"
                            className="flex size-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cartes (mobile) */}
          <div className="space-y-3 md:hidden">
            {loading ? (
              <div className="rounded-2xl border border-border bg-card px-4 py-12 text-center text-muted-foreground">
                Chargement…
              </div>
            ) : displayed.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card px-4 py-12 text-center text-muted-foreground">
                Aucun contact pour ce filtre.
              </div>
            ) : (
              displayed.map((c) => (
                <div
                  key={c._id}
                  onClick={() => setSelected(c)}
                  className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-foreground">{c.name || '—'}</span>
                        {isMember(c) && <MemberSticker />}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{c.email}</div>
                    </div>
                    <NlBadge contact={c} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    {c.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        {c.country && <Flag iso2={c.country} />}
                        {c.phone}
                      </span>
                    )}
                    <span>
                      {c.bookingsCount} résa{c.bookingsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {(c.source || []).map((s) => (
                        <span key={s} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {SOURCE_LABEL[s] || s}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        remove(c._id)
                      }}
                      disabled={busyId === c._id}
                      aria-label="Supprimer"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {selected && (
        <ContactDrawer
          contact={selected}
          busy={busyId === selected._id}
          onClose={() => setSelected(null)}
          onToggleOptIn={() => patch(selected._id, { newsletterOptIn: !selected.newsletterOptIn })}
          onUnsub={() => patch(selected._id, { unsubscribed: !selected.unsubscribedAt })}
          onSave={(tags, notes) => patch(selected._id, { tags, notes })}
          onDelete={() => remove(selected._id)}
        />
      )}

      {addOpen && (
        <AddContactModal
          onClose={() => setAddOpen(false)}
          onCreate={createContact}
          onDone={() => setAddOpen(false)}
        />
      )}
    </div>
  )
}

function ContactDrawer({
  contact,
  busy,
  onClose,
  onToggleOptIn,
  onUnsub,
  onSave,
  onDelete,
}: {
  contact: Contact
  busy: boolean
  onClose: () => void
  onToggleOptIn: () => void
  onUnsub: () => void
  onSave: (tags: string[], notes: string) => void
  onDelete: () => void
}) {
  const [tags, setTags] = useState((contact.tags ?? []).join(', '))
  const [notes, setNotes] = useState(contact.notes ?? '')
  const country = contact.country ? COUNTRY_BY_ISO2[contact.country] : undefined

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-lg text-foreground">Fiche contact</h2>
          <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">{contact.name || 'Sans nom'}</span>
              {isMember(contact) && <MemberSticker />}
            </div>
            <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
              <Mail className="size-3.5" /> {contact.email}
            </a>
            {contact.phone && (
              <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="size-3.5" />
                {country && (
                  <span className="inline-flex items-center gap-1.5">
                    <Flag iso2={country.iso2} /> {country.name}
                  </span>
                )}
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:underline">{contact.phone}</a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border p-3">
              <div className="text-xs text-muted-foreground">Réservations</div>
              <div className="font-semibold text-foreground">{contact.bookingsCount}</div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <div className="text-xs text-muted-foreground">Dernière résa</div>
              <div className="font-semibold text-foreground">{fmtDate(contact.lastBookingAt)}</div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Newsletter</div>
                <div className="text-xs text-muted-foreground">
                  {contact.unsubscribedAt
                    ? 'Désinscrit'
                    : contact.newsletterOptIn
                      ? 'Abonné (consentement)'
                      : 'Non abonné'}
                </div>
              </div>
              {!contact.unsubscribedAt && (
                <button
                  onClick={onToggleOptIn}
                  disabled={busy}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40',
                    contact.newsletterOptIn
                      ? 'bg-muted text-foreground hover:bg-muted/70'
                      : 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-300'
                  )}
                >
                  {contact.newsletterOptIn ? 'Retirer' : 'Abonner'}
                </button>
              )}
            </div>
            <button
              onClick={onUnsub}
              disabled={busy}
              className="mt-3 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-40"
            >
              {contact.unsubscribedAt ? 'Réactiver (retirer la désinscription)' : 'Marquer comme désinscrit'}
            </button>
          </div>

          {/* Tags + notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags (séparés par des virgules)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="vip, tennis, expat…"
              className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm outline-none focus-visible:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes internes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-input bg-background/70 px-3 py-2 text-sm outline-none focus-visible:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)]"
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border p-5">
          <button
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
          >
            <Trash2 className="size-4" /> Supprimer
          </button>
          <button
            onClick={() =>
              onSave(
                tags.split(',').map((t) => t.trim()).filter(Boolean),
                notes
              )
            }
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:brightness-105 disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

function AddContactModal({
  onClose,
  onCreate,
  onDone,
}: {
  onClose: () => void
  onCreate: (p: { email: string; name?: string; phone?: string; country: string; optIn: boolean }) => Promise<boolean>
  onDone: () => void
}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [iso2, setIso2] = useState('FR')
  const [number, setNumber] = useState('')
  const [optIn, setOptIn] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const country = COUNTRY_BY_ISO2[iso2]

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Email invalide')
      return
    }
    setSaving(true)
    setError('')
    try {
      const ok = await onCreate({
        email: email.trim(),
        name: name.trim() || undefined,
        phone: number.trim() ? `${country.dial} ${number.trim()}` : undefined,
        country: iso2,
        optIn,
      })
      if (ok) onDone()
      else setError('Échec de l’enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const fieldCls =
    'h-11 w-full rounded-xl border border-input bg-background/70 px-3 text-sm outline-none focus-visible:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)]'

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">Nouveau contact</h2>
          <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" className={fieldCls} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email *" className={fieldCls} />
          <div className="flex gap-2">
            <select value={iso2} onChange={(e) => setIso2(e.target.value)} className={cn(fieldCls, 'w-auto shrink-0')} aria-label="Pays">
              {COUNTRIES_ORDERED.map((c, i) => (
                <option key={`${c.iso2}-${i}`} value={c.iso2}>
                  {c.dial} · {c.name}
                </option>
              ))}
            </select>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              type="tel"
              placeholder="Téléphone"
              className={cn(fieldCls, 'min-w-0 flex-1')}
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="size-4 rounded border-input accent-accent" />
            Abonné à la newsletter (consentement obtenu)
          </label>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="h-10 rounded-xl border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted">
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground hover:brightness-105 disabled:opacity-40"
          >
            <Plus className="size-4" /> Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}
