'use client'

import { CalendarRange, Globe2, Mail, MailX, Map as MapIcon, Phone, Ticket, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { WorldChoropleth } from '@/components/admin/world-choropleth'
import { Flag } from '@/components/flag'
import { COUNTRY_BY_ISO2 } from '@/lib/country-codes'
import { cn } from '@/lib/utils'

/** Champs de contact nécessaires aux statistiques (réels ou démo). */
export interface StatsContact {
  country?: string
  phone?: string
  newsletterOptIn: boolean
  unsubscribedAt?: string | null
  bookingsCount: number
  createdAt: string
}

const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

function pct(n: number, total: number): string {
  if (!total) return '0 %'
  return `${Math.round((n / total) * 100)} %`
}

export function CrmStats({ contacts }: { contacts: StatsContact[] }) {
  const stats = useMemo(() => {
    const total = contacts.length
    const optin = contacts.filter((c) => c.newsletterOptIn && !c.unsubscribedAt).length
    const unsub = contacts.filter((c) => c.unsubscribedAt).length
    const withPhone = contacts.filter((c) => c.phone).length
    const bookings = contacts.reduce((n, c) => n + (c.bookingsCount || 0), 0)

    // Répartition par pays.
    const byCountry: Record<string, number> = {}
    for (const c of contacts) {
      if (c.country) byCountry[c.country] = (byCountry[c.country] || 0) + 1
    }
    const ranking = Object.entries(byCountry).sort((a, b) => b[1] - a[1])

    // Acquisition par mois (du plus ancien au plus récent présent dans les données).
    const monthKeys: string[] = []
    const monthCount: Record<string, number> = {}
    for (const c of contacts) {
      const d = new Date(c.createdAt)
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
      monthCount[key] = (monthCount[key] || 0) + 1
    }
    const keys = Object.keys(monthCount).sort()
    if (keys.length) {
      const [sy, sm] = keys[0].split('-').map(Number)
      const [ey, em] = keys[keys.length - 1].split('-').map(Number)
      let y = sy
      let m = sm
      while (y < ey || (y === ey && m <= em)) {
        monthKeys.push(`${y}-${String(m).padStart(2, '0')}`)
        m += 1
        if (m > 12) { m = 1; y += 1 }
      }
    }
    const series = monthKeys.slice(-10).map((k) => {
      const [, mm] = k.split('-').map(Number)
      return { key: k, label: MONTHS_FR[mm - 1], value: monthCount[k] || 0 }
    })

    return { total, optin, unsub, withPhone, bookings, byCountry, ranking, series }
  }, [contacts])

  const maxRank = stats.ranking.length ? stats.ranking[0][1] : 1
  const maxSeries = Math.max(1, ...stats.series.map((s) => s.value))
  const [showMap, setShowMap] = useState(true)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi icon={Users} label="Clients" value={stats.total} />
        <Kpi
          icon={Mail}
          label="Abonnés newsletter"
          value={stats.optin}
          hint={pct(stats.optin, stats.total)}
          tone="text-emerald-600 dark:text-emerald-400"
        />
        <Kpi icon={MailX} label="Désinscrits" value={stats.unsub} tone="text-muted-foreground" />
        <Kpi icon={Phone} label="Téléphone renseigné" value={stats.withPhone} hint={pct(stats.withPhone, stats.total)} />
        <Kpi icon={Ticket} label="Réservations" value={stats.bookings} tone="text-accent" />
        <Kpi icon={Globe2} label="Pays représentés" value={stats.ranking.length} />
      </div>

      {/* Classement pays + acquisition */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg text-foreground">Top pays</h2>
          {stats.ranking.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée pays.</p>
          ) : (
            <ul className="space-y-3">
              {stats.ranking.slice(0, 8).map(([iso, n]) => {
                const name = COUNTRY_BY_ISO2[iso]?.name ?? iso
                return (
                  <li key={iso} className="flex items-center gap-3">
                    <Flag iso2={iso} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-foreground">{name}</span>
                        <span className="shrink-0 font-medium text-muted-foreground">
                          {n} · {pct(n, stats.total)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${(n / maxRank) * 100}%` }}
                        />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Acquisition dans le temps */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <CalendarRange className="size-4 text-accent" />
            <h2 className="font-display text-lg text-foreground">Acquisition de contacts</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Nouveaux contacts par mois.</p>
          {stats.series.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pas encore d'historique.</p>
          ) : (
            <div className="flex h-44 items-end gap-1.5 sm:gap-3">
              {stats.series.map((s) => (
                <div key={s.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {s.value}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-accent/80 transition-colors group-hover:bg-accent"
                    style={{ height: `${Math.max(4, (s.value / maxSeries) * 100)}%` }}
                    title={`${s.value} contact${s.value > 1 ? 's' : ''}`}
                  />
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Carte — affichée à la demande */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe2 className="size-4 text-accent" />
            <h2 className="font-display text-lg text-foreground">D&apos;où viennent vos clients</h2>
          </div>
          <button
            onClick={() => setShowMap((v) => !v)}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <MapIcon className="size-4" />
            {showMap ? 'Masquer la carte' : 'Voir la carte'}
          </button>
        </div>
        {showMap && (
          <div className="mt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Répartition par pays (déduite de l&apos;indicatif téléphonique).
            </p>
            <WorldChoropleth data={stats.byCountry} />
          </div>
        )}
      </div>
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  hint?: string
  tone?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground/70" />
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn('font-display text-2xl leading-none text-foreground', tone)}>{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  )
}
