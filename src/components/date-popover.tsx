'use client'

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

/** yyyy-mm-dd ↔ Date locale (sans dérive de fuseau). */
function toKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
function fromKey(key: string): Date | null {
  if (!key) return null
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

const WEEKDAYS: Record<Locale, string[]> = {
  fr: ['lu', 'ma', 'me', 'je', 've', 'sa', 'di'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
}
const LABELS: Record<Locale, { today: string; tomorrow: string; when: string }> = {
  fr: { today: "Aujourd'hui", tomorrow: 'Demain', when: 'Quand' },
  en: { today: 'Today', tomorrow: 'Tomorrow', when: 'When' },
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Sélecteur de date custom (popover calendrier) au design Shi Shi.
 * Remplace l'`<input type="date">` natif : raccourcis Aujourd'hui/Demain,
 * navigation mensuelle, jours passés grisés, ouverture animée.
 */
export function DatePopover({
  value,
  today,
  onChange,
  locale,
}: {
  value: string
  today: string
  onChange: (key: string) => void
  locale: Locale
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const todayDate = fromKey(today) ?? new Date()
  const selected = fromKey(value)
  const [view, setView] = useState(() => selected ?? todayDate)

  // Réaligne le mois affiché sur la valeur quand le popover s'ouvre.
  useEffect(() => {
    if (open) setView(selected ?? todayDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Ferme au clic extérieur / Échap.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const fmtDisplay = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'long' }),
    [locale]
  )
  const fmtMonth = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
    [locale]
  )

  // Grille du mois affiché, début lundi (cases du mois précédent/suivant en padding).
  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1)
    const offset = (first.getDay() + 6) % 7 // lundi = 0
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
    const out: (Date | null)[] = []
    for (let i = 0; i < offset; i++) out.push(null)
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(view.getFullYear(), view.getMonth(), d))
    while (out.length % 7 !== 0) out.push(null)
    return out
  }, [view])

  const todayKey = toKey(todayDate)
  const labels = LABELS[locale]

  function pick(d: Date) {
    onChange(toKey(d))
    setOpen(false)
  }

  const tomorrow = addDays(todayDate, 1)
  const isToday = value === todayKey
  const isTomorrow = value === toKey(tomorrow)

  return (
    <div ref={ref} className="relative flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex flex-col justify-center rounded-2xl px-4 py-2.5 text-left transition-colors hover:bg-secondary/40 aria-expanded:bg-secondary/60"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {labels.when}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4 shrink-0 text-ocean" aria-hidden />
          <span className="font-editorial text-[15px] font-medium text-foreground">
            {selected ? cap(fmtDisplay.format(selected)) : labels.when}
          </span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={labels.when}
          className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(20rem,calc(100vw-2.5rem))] origin-top rounded-3xl border border-border bg-popover p-4 shadow-[0_30px_70px_-24px_oklch(0.16_0.02_55/0.55)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 ease-out"
        >
          {/* Raccourcis Aujourd'hui / Demain */}
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { label: labels.today, date: todayDate, active: isToday },
                { label: labels.tomorrow, date: tomorrow, active: isTomorrow },
              ] as const
            ).map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => pick(q.date)}
                className={cn(
                  'rounded-full px-4 py-2.5 text-sm font-semibold transition-colors',
                  q.active
                    ? 'bg-foreground text-background'
                    : 'text-foreground ring-1 ring-border hover:bg-secondary/70'
                )}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Navigation mois */}
          <div className="mt-4 flex items-center justify-between px-1">
            <button
              type="button"
              aria-label="Mois précédent"
              onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <span className="font-editorial text-[15px] font-medium text-foreground">
              {fmtMonth.format(view)}
            </span>
            <button
              type="button"
              aria-label="Mois suivant"
              onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>

          {/* En-têtes jours */}
          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS[locale].map((d) => (
              <span key={d} className="text-xs font-medium text-muted-foreground">
                {d}
              </span>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />
              const key = toKey(d)
              const isPast = key < todayKey
              const isSelected = key === value
              const isTodayCell = key === todayKey
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isPast}
                  onClick={() => pick(d)}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition-colors',
                    isPast && 'cursor-default text-muted-foreground/35',
                    !isPast && !isSelected && 'text-foreground hover:bg-secondary/70',
                    isSelected && 'bg-foreground text-background',
                    !isSelected && isTodayCell && 'ring-1 ring-accent/60'
                  )}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
