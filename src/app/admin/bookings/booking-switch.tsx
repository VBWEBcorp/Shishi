'use client'

import {
  CalendarOff,
  Check,
  Loader2,
  Lock,
  MessageCircle,
  Plus,
  Trash2,
  Unlock,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { ActivityIcon } from '@/components/activity-icon'
import { DEFAUT, NOTICE_DEFAUT, normaliser, type BookingSettingsData, type ClosureRule } from '@/lib/booking-settings'
import { activities } from '@/lib/activities'
import { isBookable } from '@/lib/availability'
import { cn } from '@/lib/utils'

/**
 * L'interrupteur des réservations, dans l'espace admin.
 *
 * Demande du club, mot pour mot : « vous avez la main pour dire ok c'est activé,
 * c'est désactivé, le système direct libre-service », et « vous mettez juste
 * bloqué et c'est merci de nous contacter sur WhatsApp ». Le tout depuis un
 * téléphone, en dix secondes, sans passer par nous.
 *
 * Trois réglages, du plus large au plus fin :
 *  · l'interrupteur général, celui qu'on coupe une semaine chargée ;
 *  · une activité à la fois, quand le kids club ferme mais pas le tennis ;
 *  · des journées bloquées, pour une absence ou des congés.
 *
 * Chaque changement part immédiatement en base : pas de bouton « enregistrer »
 * à oublier. Le site le voit au chargement suivant (cache de 15 secondes).
 */

const DATE = /^\d{4}-\d{2}-\d{2}$/

function jourJ(): string {
  return new Date().toISOString().slice(0, 10)
}

function decaler(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function enFrancais(date: string): string {
  if (!DATE.test(date)) return date
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

/** Activités qui disposent d'un moteur de créneaux (les seules pilotables). */
const RESERVABLES = activities.filter((a) => isBookable(a.slug))
const A_VENIR = activities.filter((a) => !isBookable(a.slug))

export function BookingSwitch() {
  const [reglages, setReglages] = useState<BookingSettingsData>(DEFAUT)
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  // Formulaire d'ajout d'une fermeture.
  const [du, setDu] = useState(() => jourJ())
  const [au, setAu] = useState(() => jourJ())
  const [portee, setPortee] = useState('')

  // Message affiché aux visiteurs quand c'est fermé.
  const [noticeFr, setNoticeFr] = useState('')
  const [noticeEn, setNoticeEn] = useState('')
  const [noticeOuverte, setNoticeOuverte] = useState(false)
  const [noticeEnregistree, setNoticeEnregistree] = useState(false)

  useEffect(() => {
    fetch('/api/booking-settings')
      .then((r) => r.json())
      .then((d) => {
        const r = normaliser(d)
        setReglages(r)
        setNoticeFr(r.closedNotice.fr)
        setNoticeEn(r.closedNotice.en)
      })
      .catch(() => setErreur('Réglages illisibles. Rechargez la page.'))
      .finally(() => setChargement(false))
  }, [])

  const enregistrer = useCallback(async (patch: Partial<BookingSettingsData>) => {
    setEnvoi(true)
    setErreur('')
    try {
      const res = await fetch('/api/booking-settings', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error(String(res.status))
      setReglages(normaliser(await res.json()))
      return true
    } catch {
      setErreur('Enregistrement impossible. Réessayez.')
      return false
    } finally {
      setEnvoi(false)
    }
  }, [])

  const ouvert = reglages.online

  function ajouterFermeture() {
    if (!DATE.test(du) || !DATE.test(au)) return
    const nouvelle: ClosureRule = {
      from: du <= au ? du : au,
      to: du <= au ? au : du,
      activitySlug: portee,
      reason: '',
    }
    enregistrer({ closures: [...reglages.closures, nouvelle] })
  }

  function bloquer(jours: number, libelle: string) {
    const debut = jourJ()
    const fin = decaler(debut, jours - 1)
    enregistrer({
      closures: [...reglages.closures, { from: debut, to: fin, activitySlug: '', reason: libelle }],
    })
  }

  function retirerFermeture(i: number) {
    enregistrer({ closures: reglages.closures.filter((_, k) => k !== i) })
  }

  if (chargement) {
    return <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      {/* ── 1 · L'interrupteur général ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-xl ring-1',
              ouvert
                ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400'
                : 'bg-orange-500/10 text-orange-600 ring-orange-500/25 dark:text-orange-400'
            )}
          >
            {ouvert ? <Unlock className="size-5" aria-hidden /> : <Lock className="size-5" aria-hidden />}
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold text-foreground">
              Réservation en ligne
            </h2>
            <p className="text-xs text-muted-foreground">
              {ouvert
                ? 'Ouverte : les clients réservent depuis le site.'
                : 'Fermée : le site affiche « contactez-nous sur WhatsApp ».'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={envoi}
          onClick={() => enregistrer({ online: !ouvert })}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60',
            ouvert
              ? 'border border-border bg-card text-foreground hover:bg-muted'
              : 'bg-accent text-accent-foreground hover:brightness-105'
          )}
        >
          {envoi ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : ouvert ? (
            <Lock className="size-4" aria-hidden />
          ) : (
            <Unlock className="size-4" aria-hidden />
          )}
          {ouvert ? 'Fermer les réservations' : 'Ouvrir les réservations'}
        </button>
      </div>

      {erreur && (
        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{erreur}</p>
      )}

      {/* ── 2 · Activité par activité ──────────────────────────────────── */}
      <div className="mt-5 border-t border-border/60 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Par activité
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {RESERVABLES.map((a) => {
            const actif = reglages.activities[a.slug] !== false
            return (
              <button
                key={a.slug}
                type="button"
                disabled={envoi}
                onClick={() =>
                  enregistrer({ activities: { [a.slug]: !actif } as Record<string, boolean> })
                }
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-colors disabled:opacity-60',
                  actif
                    ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15'
                    : 'border-border bg-muted/50 hover:bg-muted'
                )}
                title={actif ? 'Cliquer pour fermer cette activité' : 'Cliquer pour ouvrir cette activité'}
              >
                <span className="flex size-6 items-center justify-center rounded-lg bg-card text-accent ring-1 ring-border">
                  <ActivityIcon name={a.icon} className="size-3.5" />
                </span>
                <span className={cn('font-medium', actif ? 'text-foreground' : 'text-muted-foreground line-through')}>
                  {a.name.fr}
                </span>
                {actif && <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />}
              </button>
            )
          })}

          {A_VENIR.map((a) => (
            <span
              key={a.slug}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-sm"
              title="Pas encore de moteur de créneaux pour cette activité"
            >
              <span className="flex size-6 items-center justify-center rounded-lg bg-card text-accent ring-1 ring-border">
                <ActivityIcon name={a.icon} className="size-3.5" />
              </span>
              <span className="font-medium text-foreground">{a.name.fr}</span>
              <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
                Bientôt
              </span>
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Une activité barrée n&apos;est plus réservable sur le site, même si l&apos;interrupteur
          général est ouvert. Les activités « Bientôt » renvoient vers le contact.
        </p>
      </div>

      {/* ── 3 · Journées bloquées ──────────────────────────────────────── */}
      <div className="mt-5 border-t border-border/60 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <CalendarOff className="size-3.5" aria-hidden />
            Journées bloquées
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={envoi}
              onClick={() => bloquer(1, "Aujourd'hui")}
              className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              Bloquer aujourd&apos;hui
            </button>
            <button
              type="button"
              disabled={envoi}
              onClick={() => bloquer(7, 'Semaine')}
              className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              Bloquer 7 jours
            </button>
          </div>
        </div>

        {reglages.closures.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {reglages.closures.map((c, i) => (
              <li
                key={`${c.from}-${c.to}-${c.activitySlug}-${i}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2"
              >
                <span className="min-w-0 text-sm text-foreground">
                  <span className="font-medium">
                    {c.from === c.to ? enFrancais(c.from) : `${enFrancais(c.from)} → ${enFrancais(c.to)}`}
                  </span>
                  <span className="text-muted-foreground">
                    {' · '}
                    {c.activitySlug
                      ? activities.find((a) => a.slug === c.activitySlug)?.name.fr ?? c.activitySlug
                      : 'tout le club'}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={envoi}
                  onClick={() => retirerFermeture(i)}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
                  aria-label="Débloquer"
                  title="Débloquer"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">Aucune journée bloquée.</p>
        )}

        {/* Ajout d'une période précise */}
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Du
            <input
              type="date"
              value={du}
              onChange={(e) => setDu(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Au
            <input
              type="date"
              value={au}
              onChange={(e) => setAu(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Activité
            <select
              value={portee}
              onChange={(e) => setPortee(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none"
            >
              <option value="">Tout le club</option>
              {RESERVABLES.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name.fr}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={envoi}
            onClick={ajouterFermeture}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105 disabled:opacity-60"
          >
            <Plus className="size-4" aria-hidden />
            Bloquer
          </button>
        </div>
      </div>

      {/* ── 4 · Le message vu par les visiteurs ────────────────────────── */}
      <div className="mt-5 border-t border-border/60 pt-4">
        <button
          type="button"
          onClick={() => setNoticeOuverte((v) => !v)}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="size-3.5" aria-hidden />
          Message affiché quand c&apos;est fermé
        </button>

        {noticeOuverte && (
          <div className="mt-3 space-y-2">
            <textarea
              value={noticeFr}
              onChange={(e) => {
                setNoticeFr(e.target.value)
                setNoticeEnregistree(false)
              }}
              rows={2}
              placeholder={NOTICE_DEFAUT.fr}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <textarea
              value={noticeEn}
              onChange={(e) => {
                setNoticeEn(e.target.value)
                setNoticeEnregistree(false)
              }}
              rows={2}
              placeholder={NOTICE_DEFAUT.en}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={envoi}
                onClick={async () => {
                  const ok = await enregistrer({ closedNotice: { fr: noticeFr, en: noticeEn } })
                  if (ok) setNoticeEnregistree(true)
                }}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-all hover:brightness-105 disabled:opacity-60"
              >
                Enregistrer le message
              </button>
              {noticeEnregistree && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" aria-hidden />
                  Enregistré
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                Laissé vide, le site affiche son texte par défaut.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
