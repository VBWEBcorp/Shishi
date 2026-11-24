'use client'

import { Phone, RefreshCw, Users, Waves } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AQUAGYM_PLACES, prochainesSeances } from '@/lib/aquagym-sessions'
import { cn } from '@/lib/utils'

/**
 * Inscrits aux séances d'aquagym, séance par séance (demande de Paul Poulain,
 * 20/11/2026). Les inscriptions viennent du formulaire de /aquagym-lamai ;
 * une réservation aquagym saisie depuis « Réservations » apparaît aussi ici.
 */

interface Inscription {
  _id: string
  date: string
  time: string
  name: string
  email?: string
  phone?: string
  partySize?: number
  notes?: string
  createdByAdmin?: boolean
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function libelle(date: string, time: string): string {
  const d = new Date(`${date}T12:00:00Z`)
  const jour = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
  const [h, m] = time.split(':')
  const heure = `${Number(h)} h${m && m !== '00' ? ` ${m}` : ''}`
  return `${jour.charAt(0).toUpperCase()}${jour.slice(1)} à ${heure}`
}

function lienWhatsapp(phone: string): string | null {
  const chiffres = phone.replace(/[^\d]/g, '')
  return chiffres.length >= 8 ? `https://wa.me/${chiffres}` : null
}

export default function AquagymAdminPage() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [passees, setPassees] = useState(false)

  const charger = useCallback(async () => {
    setChargement(true)
    setErreur('')
    try {
      const res = await fetch('/api/aquagym', { headers: authHeaders() })
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      setInscriptions(data.bookings ?? [])
    } catch {
      setErreur('Impossible de charger les inscriptions.')
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    charger()
  }, [charger])

  // Séances : les prochaines séances prévues (même vides) + toute date qui a des inscrits.
  const seances = useMemo(() => {
    const aujourdHui = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)
    const cles = new Map<string, { date: string; time: string }>()
    for (const d of prochainesSeances()) cles.set(`${d} 09:00`, { date: d, time: '09:00' })
    for (const b of inscriptions) cles.set(`${b.date} ${b.time}`, { date: b.date, time: b.time })
    return [...cles.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cle, s]) => ({
        cle,
        ...s,
        passee: s.date < aujourdHui,
        inscrits: inscriptions.filter((b) => b.date === s.date && b.time === s.time),
      }))
      .filter((s) => passees || !s.passee)
  }, [inscriptions, passees])

  return (
    <div className="mx-auto max-w-5xl px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <Waves className="size-6 text-accent" /> Aquagym
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Les inscrits de chaque séance (lundi et vendredi à 9 h), reçus par le formulaire de la
            page aquagym.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPassees((v) => !v)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {passees ? 'Masquer les séances passées' : 'Voir les séances passées'}
          </button>
          <button
            type="button"
            onClick={charger}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <RefreshCw className={cn('size-4', chargement && 'animate-spin')} /> Actualiser
          </button>
        </div>
      </div>

      {erreur && <p className="mt-6 text-sm font-medium text-destructive">{erreur}</p>}

      <div className="mt-8 space-y-5">
        {seances.map((s) => {
          const personnes = s.inscrits.reduce((n, b) => n + (b.partySize || 1), 0)
          return (
            <section
              key={s.cle}
              className={cn('rounded-2xl border border-border bg-card p-5', s.passee && 'opacity-70')}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">{libelle(s.date, s.time)}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-foreground">
                  <Users className="size-3.5" />
                  {personnes} / {AQUAGYM_PLACES} personnes
                  {personnes >= AQUAGYM_PLACES && ' · complet'}
                </span>
              </div>
              {s.inscrits.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Aucun inscrit pour l’instant.</p>
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {s.inscrits.map((b) => {
                    const wa = b.phone ? lienWhatsapp(b.phone) : null
                    return (
                      <li key={b._id} className="flex flex-wrap items-start justify-between gap-2 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {b.name}
                            {(b.partySize || 1) > 1 && (
                              <span className="ml-2 text-muted-foreground">× {b.partySize}</span>
                            )}
                          </p>
                          <p className="break-all text-xs text-muted-foreground">
                            {[b.email, b.phone].filter(Boolean).join(' · ')}
                          </p>
                          {b.notes && <p className="mt-1 text-xs text-muted-foreground">« {b.notes} »</p>}
                        </div>
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            <Phone className="size-3.5" /> WhatsApp
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
