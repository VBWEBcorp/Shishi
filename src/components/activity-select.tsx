'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ActivityIcon } from '@/components/activity-icon'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { cn } from '@/lib/utils'

/**
 * Sélecteur d'activité custom (popover liste) au design Shi Shi — strictement
 * aligné sur `DatePopover`. Réutilisé tel quel dans la barre de recherche du
 * hero (`variant="bar"`) ET dans le popup de réservation (`variant="field"`),
 * pour que le menu ouvert soit identique aux deux endroits.
 */
export function ActivitySelect({
  value,
  onChange,
  locale,
  variant = 'bar',
  label,
  placeholder,
  id,
  bookableOnly = false,
}: {
  value: string
  onChange: (slug: string) => void
  locale: Locale
  /** `bar` = barre de recherche du hero · `field` = champ de formulaire bordé. */
  variant?: 'bar' | 'field'
  /** Libellé eyebrow (variante bar). */
  label?: string
  /** Texte affiché quand aucune activité n'est choisie. */
  placeholder?: string
  id?: string
  /** N'affiche que les activités réservables en ligne (moteur de réservation). */
  bookableOnly?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const options = bookableOnly ? activities.filter((a) => a.bookable) : activities
  const selected = activities.find((a) => a.slug === value) ?? null

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

  function pick(slug: string) {
    onChange(slug)
    setOpen(false)
  }

  return (
    <div ref={ref} className={cn('relative', variant === 'field' ? 'w-full' : 'flex flex-1')}>
      {variant === 'field' ? (
        <button
          id={id}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background/70 px-3.5 text-left text-sm transition-shadow focus-visible:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)] focus-visible:outline-none aria-expanded:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)]"
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected && (
              <ActivityIcon name={selected.icon} className="size-4 shrink-0 text-accent" aria-hidden />
            )}
            <span className={cn('truncate', selected ? 'font-medium text-foreground' : 'text-muted-foreground')}>
              {selected ? selected.name[locale] : (placeholder ?? '')}
            </span>
          </span>
          <ChevronDown
            className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition-colors hover:bg-secondary/50 aria-expanded:bg-secondary/60"
        >
          {selected && (
            <ActivityIcon name={selected.icon} className="size-5 shrink-0 text-accent" aria-hidden />
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            {label && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </span>
            )}
            <span className="truncate font-editorial text-[15px] font-medium text-foreground">
              {selected ? selected.name[locale] : (placeholder ?? '')}
            </span>
          </span>
          <ChevronDown
            className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>
      )}

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+0.6rem)] z-50 w-[min(20rem,calc(100vw-2.5rem))] origin-top rounded-3xl border border-border bg-popover p-2 shadow-[0_30px_70px_-24px_oklch(0.16_0.02_55/0.55)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 ease-out"
        >
          {options.map((a) => {
            const active = a.slug === value
            return (
              <li key={a.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(a.slug)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    active
                      ? 'bg-foreground text-background'
                      : a.featured
                        ? 'text-foreground ring-1 ring-accent/50 hover:bg-secondary/70'
                        : 'text-foreground hover:bg-secondary/70'
                  )}
                >
                  <ActivityIcon
                    name={a.icon}
                    className={cn('size-5 shrink-0', active ? 'text-background' : 'text-accent')}
                  />
                  <span className="flex-1 truncate">{a.name[locale]}</span>
                  {a.featured && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        active ? 'bg-background/15 text-background' : 'bg-accent/10 text-accent'
                      )}
                    >
                      Signature
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
