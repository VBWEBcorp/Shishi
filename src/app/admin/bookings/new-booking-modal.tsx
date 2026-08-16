'use client'

import { Ban, CalendarPlus, Loader2, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ActivityIcon } from '@/components/activity-icon'
import { activities } from '@/lib/activities'
import {
  ADMIN_STEP_MINUTES,
  formatDuration,
  isBookable,
  isDayPass,
  MAX_BOOKING_MINUTES,
} from '@/lib/availability'
import { isPricePerPerson } from '@/lib/booking-pricing'
import { cn } from '@/lib/utils'

type Mode = 'booking' | 'block'
type Slot = { time: string; endTime: string; capacity: number; available: number }
/** Fin possible pour la plage en cours de saisie. */
type EndOption = { end: string; minutes: number }

const BOOKABLE = activities.filter((a) => isBookable(a.slug))

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** yyyy-mm-dd du jour (heure locale). */
function todayYmd(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** « 2026-08-20 » → « jeu. 20 août ». */
function frDate(ymd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })
}

const ERROR_LABELS: Record<string, string> = {
  'slot-unavailable': 'Ce créneau n’est plus disponible. Choisissez-en un autre.',
  'invalid-email': 'Email invalide.',
  'missing-name': 'Le nom du client est requis.',
  'missing-fields': 'Activité, date et créneau sont requis.',
  'invalid-slot': 'Cette plage horaire n’est pas valide (début ou durée).',
  'date-in-past': 'Ce créneau est déjà passé.',
  'invalid-date': 'Date invalide.',
  'not-bookable': 'Cette activité n’est pas réservable.',
}

/** Durée pré-sélectionnée quand la plage le permet : une heure. */
const DEFAULT_DURATION_MINUTES = 60

/**
 * Modale de création MANUELLE d'une réservation (client de passage / par
 * téléphone) ou de BLOCAGE d'un créneau, depuis l'espace admin. Reprend la
 * charte de l'admin (cartes arrondies, accent orange) — aucun nouveau style.
 *
 * Grille de saisie à la DEMI-HEURE (`scope=admin`) : le club enregistre ce qui
 * se passe réellement (ex. une élève de 07:30 à 09:00), là où le site public
 * reste sur des créneaux d'1 h pleine. La plage saisie ici rend automatiquement
 * indisponibles, côté site, TOUS les créneaux qu'elle chevauche.
 */
export function NewBookingModal({
  onClose,
  onCreated,
  initialDate,
}: {
  onClose: () => void
  onCreated: () => void
  /** Date pré-remplie (ex. jour cliqué dans le calendrier). Défaut : aujourd'hui. */
  initialDate?: string
}) {
  const [mode, setMode] = useState<Mode>('booking')
  const [activitySlug, setActivitySlug] = useState(BOOKABLE[0]?.slug ?? '')
  const [date, setDate] = useState(initialDate || todayYmd())
  const [time, setTime] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [stepMinutes, setStepMinutes] = useState(ADMIN_STEP_MINUTES)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MINUTES)
  const [partySize, setPartySize] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [newsletterOptIn, setNewsletterOptIn] = useState(false)
  const [locale, setLocale] = useState<'fr' | 'en'>('fr')
  const [participants, setParticipants] = useState<{ name: string; email: string; phone: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activity = useMemo(() => BOOKABLE.find((a) => a.slug === activitySlug), [activitySlug])
  const dayPass = isDayPass(activitySlug) // fitness / pool : accès à la journée, horaire imposé
  const perPerson = isPricePerPerson(activitySlug) // fitness / pool / kids-club : facturé par personne

  // Charge la grille INTERNE (demi-heures) pour l'activité + la date choisies.
  // On conserve aussi les créneaux complets : ils restent visibles (grisés) pour
  // que l'admin comprenne pourquoi une heure manque, et servent de borne aux
  // fins de plage proposées.
  const loadSlots = useCallback(async () => {
    if (!activitySlug || !date) return
    setSlotsLoading(true)
    try {
      const res = await fetch(
        `/api/availability?activity=${encodeURIComponent(activitySlug)}&date=${encodeURIComponent(date)}&scope=admin`,
        { cache: 'no-store' }
      )
      const data = await res.json()
      const all: Slot[] = Array.isArray(data?.slots) ? data.slots : []
      setSlots(all)
      setStepMinutes(Number(data?.stepMinutes) || ADMIN_STEP_MINUTES)
      // Réinitialise le créneau s'il n'est plus libre.
      setTime((prev) => (all.some((s) => s.time === prev && s.available > 0) ? prev : ''))
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }, [activitySlug, date])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  /**
   * Fins de plage possibles à partir du créneau choisi : on avance de demi-heure
   * en demi-heure tant que la place reste libre, et on s'arrête au premier
   * créneau complet (ou à la fin de l'amplitude / la durée maximale).
   */
  const endOptions = useMemo<EndOption[]>(() => {
    if (dayPass) return []
    const startIndex = slots.findIndex((s) => s.time === time)
    if (startIndex < 0) return []
    const out: EndOption[] = []
    let minutes = 0
    for (let i = startIndex; i < slots.length; i++) {
      const slot = slots[i]
      if (slot.available <= 0) break
      // La plage doit rester d'un seul tenant : un trou dans la grille l'arrête.
      if (out.length && slot.time !== out[out.length - 1].end) break
      minutes += stepMinutes
      if (minutes > MAX_BOOKING_MINUTES) break
      out.push({ end: slot.endTime, minutes })
    }
    return out
  }, [slots, time, stepMinutes, dayPass])

  // Recale la durée sur ce qui est réellement proposé (défaut : 1 h si possible).
  useEffect(() => {
    if (!endOptions.length) return
    setDurationMinutes((prev) => {
      if (endOptions.some((o) => o.minutes === prev)) return prev
      const preferred = endOptions.find((o) => o.minutes === DEFAULT_DURATION_MINUTES)
      return preferred?.minutes ?? endOptions[endOptions.length - 1].minutes
    })
  }, [endOptions])

  /** Heure de fin retenue pour la plage en cours. */
  const selectedEnd = endOptions.find((o) => o.minutes === durationMinutes)?.end ?? ''

  /**
   * Récapitulatif affiché près du bouton de validation : ce qui va réellement
   * être créé, sans avoir à remonter en haut du formulaire.
   */
  const recap = !time
    ? 'Choisissez une activité, une date et une heure de début.'
    : [
        activity?.name.fr,
        frDate(date),
        dayPass ? 'accès journée' : `${time} → ${selectedEnd} · ${formatDuration(durationMinutes)}`,
      ]
        .filter(Boolean)
        .join(' · ')

  // Ferme sur Échap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit() {
    setError(null)
    if (!activitySlug || !date || !time) {
      setError(ERROR_LABELS['missing-fields'])
      return
    }
    // Tolérance : nom/email facultatifs. Si un email est saisi, il doit être valide.
    if (mode === 'booking' && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError(ERROR_LABELS['invalid-email'])
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          activitySlug,
          date,
          time,
          durationMinutes: dayPass ? undefined : durationMinutes,
          partySize: perPerson ? partySize : 1,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
          locale,
          sendEmail: mode === 'booking' && sendEmail,
          newsletterOptIn: mode === 'booking' && newsletterOptIn,
          participants:
            mode === 'booking'
              ? participants.map((p) => ({ name: p.name.trim(), email: p.email.trim(), phone: p.phone.trim() }))
              : [],
        }),
      })
      if (res.status === 401) {
        localStorage.removeItem('authToken')
        window.location.href = '/admin/login'
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(ERROR_LABELS[data?.error] ?? 'Une erreur est survenue.')
        return
      }
      onCreated()
      onClose()
    } catch {
      setError('Une erreur réseau est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)]'
  const labelCls = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      {/*
        Colonne à hauteur bornée : en-tête et actions restent fixes, seul le
        contenu défile. Sans ce plafond, une modale plus haute que l'écran se
        retrouvait rognée en haut ET en bas (centrage vertical + débordement).
        Sur grand écran, deux colonnes : « quand » à gauche, « qui » à droite.
      */}
      <div
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:max-h-[calc(100dvh-3rem)] sm:max-w-2xl lg:max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <CalendarPlus className="size-5 text-accent" aria-hidden />
            Nouvelle réservation
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {/* Choix du mode — hors zone défilante : toujours sous les yeux */}
        <div className="shrink-0 border-b border-border px-5 py-3">
          <div className="inline-flex w-full rounded-xl border border-border bg-muted/40 p-1">
            {([
              { key: 'booking', label: 'Réservation client', Icon: CalendarPlus },
              { key: 'block', label: 'Bloquer un créneau', Icon: Ban },
            ] as const).map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={cn(
                  'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  mode === m.key ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <m.Icon className="size-4" aria-hidden />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid flex-1 gap-x-6 gap-y-4 overflow-y-auto p-5 lg:grid-cols-2 lg:items-start">
          {/* ── Colonne « quand » ─────────────────────────────────────────── */}
          <div className="space-y-4">
          {/* Activité */}
          <div className="space-y-1.5">
            <label className={labelCls}>Activité</label>
            <div className="flex flex-wrap gap-2">
              {BOOKABLE.map((a) => (
                <button
                  key={a.slug}
                  onClick={() => setActivitySlug(a.slug)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors',
                    activitySlug === a.slug
                      ? 'border-accent bg-accent/10 text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ActivityIcon name={a.icon} className="size-4" />
                  {a.name.fr}
                </button>
              ))}
            </div>
          </div>

          {/* Date + créneau */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelCls} htmlFor="nb-date">Date</label>
              <input
                id="nb-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls} htmlFor="nb-time">
                {dayPass ? 'Créneau' : 'Début'}
              </label>
              <select
                id="nb-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputCls}
                disabled={slotsLoading}
              >
                <option value="">
                  {slotsLoading
                    ? 'Chargement…'
                    : !slots.some((s) => s.available > 0)
                      ? 'Aucun créneau libre'
                      : 'Choisir…'}
                </option>
                {slots.map((s) => {
                  const taken = s.capacity - s.available
                  return (
                    <option key={s.time} value={s.time} disabled={s.available <= 0}>
                      {s.time}
                      {s.available <= 0
                        ? ' · complet'
                        : taken > 0
                          ? ` · ${taken} déjà réservé${taken > 1 ? 's' : ''}`
                          : ''}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Fin de la plage — saisie à la demi-heure (interne uniquement) */}
          {!dayPass && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelCls} htmlFor="nb-end">Fin</label>
                <select
                  id="nb-end"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className={inputCls}
                  disabled={!time || endOptions.length === 0}
                >
                  {endOptions.length === 0 ? (
                    <option value={durationMinutes}>—</option>
                  ) : (
                    endOptions.map((o) => (
                      <option key={o.minutes} value={o.minutes}>
                        {o.end} · {formatDuration(o.minutes)}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  {time && endOptions.length > 0
                    ? `Séance de ${time} à ${selectedEnd || '—'}. Les créneaux du site qui chevauchent cette plage passent automatiquement en indisponible.`
                    : 'Choisissez un début : les demi-heures sont réservées à l’espace admin, les clients ne voient que des créneaux d’1 h.'}
                </p>
              </div>
              {perPerson && mode === 'booking' && (
                <div className="space-y-1.5">
                  <label className={labelCls} htmlFor="nb-party">Personnes</label>
                  <input
                    id="nb-party"
                    type="number"
                    min={1}
                    max={20}
                    value={partySize}
                    onChange={(e) => setPartySize(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                    className={inputCls}
                  />
                </div>
              )}
            </div>
          )}

          {/* Personnes — pass journée (le nombre pilote le tarif) */}
          {dayPass && perPerson && mode === 'booking' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelCls} htmlFor="nb-party-day">Personnes</label>
                <input
                  id="nb-party-day"
                  type="number"
                  min={1}
                  max={20}
                  value={partySize}
                  onChange={(e) => setPartySize(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                  className={inputCls}
                />
              </div>
            </div>
          )}
          </div>

          {/* ── Colonne « qui » ───────────────────────────────────────────── */}
          <div className="space-y-4">
          {/* Coordonnées client (mode réservation uniquement) — tout est facultatif */}
          {mode === 'booking' && (
            <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3">
              <p className="text-[11px] text-muted-foreground">
                Coordonnées facultatives : saisissez ce que vous avez, le reste peut rester vide.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelCls} htmlFor="nb-name">Nom du client (optionnel)</label>
                  <input id="nb-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Jean Dupont" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} htmlFor="nb-email">Email (optionnel)</label>
                  <input id="nb-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="jean@email.com" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelCls} htmlFor="nb-phone">Téléphone (optionnel)</label>
                  <input id="nb-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+33 6 12 34 56 78" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls} htmlFor="nb-locale">Langue du client</label>
                  <select
                    id="nb-locale"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as 'fr' | 'en')}
                    className={inputCls}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Participants supplémentaires (facultatif) — parité avec le tunnel public */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={labelCls}>Autres participants (facultatif)</span>
                  <button
                    type="button"
                    onClick={() => setParticipants((p) => [...p, { name: '', email: '', phone: '' }])}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Plus className="size-3.5" aria-hidden /> Ajouter
                  </button>
                </div>
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={p.name}
                      onChange={(e) => setParticipants((arr) => arr.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                      className={inputCls}
                      placeholder="Nom"
                    />
                    <input
                      value={p.email}
                      onChange={(e) => setParticipants((arr) => arr.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))}
                      className={inputCls}
                      placeholder="Email (optionnel)"
                    />
                    <button
                      type="button"
                      onClick={() => setParticipants((arr) => arr.filter((_, j) => j !== i))}
                      aria-label="Retirer ce participant"
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-red-600"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="size-4 rounded border-border text-accent focus-visible:ring-accent"
                />
                Le client accepte de recevoir la newsletter
              </label>
              <label className="flex items-start gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded border-border text-accent focus-visible:ring-accent"
                />
                <span>
                  Envoyer la confirmation par email au client
                  <span className="block text-[11px] text-muted-foreground">
                    Même email que pour une réservation en ligne (si un email est renseigné). À décocher pour une résa déjà passée.
                  </span>
                </span>
              </label>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className={labelCls} htmlFor="nb-notes">
              {mode === 'block' ? 'Motif (optionnel)' : 'Notes (optionnel)'}
            </label>
            <textarea
              id="nb-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none"
              placeholder={mode === 'block' ? 'Ex. maintenance du terrain' : 'Informations complémentaires…'}
            />
          </div>
          </div>
        </div>

        {/* Pied : récapitulatif + actions (toujours visible, hors défilement) */}
        <div className="shrink-0 border-t border-border px-5 py-4">
          {error && (
            <p className="mb-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{recap}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={submit}
                disabled={submitting || !time}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105 disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : mode === 'block' ? (
                  <Ban className="size-4" aria-hidden />
                ) : (
                  <CalendarPlus className="size-4" aria-hidden />
                )}
                {mode === 'block' ? 'Bloquer le créneau' : 'Créer la réservation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
