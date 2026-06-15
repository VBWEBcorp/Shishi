'use client'

import { useEffect, useRef, useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'

import { cn } from '@/lib/utils'

/** Quelques couleurs rapides (charte + classiques). */
const PRESETS = ['#111111', '#ffffff', '#D95A00', '#0F766E', '#2563EB', '#059669', '#DC2626', '#F59E0B']

/**
 * Sélecteur de couleur moderne : un bouton (pastille + hex) ouvre un popover
 * avec un vrai dégradé + curseur (react-colorful), un champ hex et des
 * raccourcis. Aucun sélecteur natif « vieillot ».
 */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fermeture au clic extérieur + touche Échap.
  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div ref={ref} className="relative w-fit">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-input bg-background/60 pl-1.5 pr-3 transition-colors hover:bg-muted"
        >
          <span className="size-7 rounded-lg border border-black/10 shadow-inner" style={{ backgroundColor: value }} />
          <span className="font-mono text-sm uppercase text-foreground">{value}</span>
        </button>

        {open && (
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[232px] rounded-2xl border border-border bg-popover p-3 shadow-xl">
            <HexColorPicker color={value} onChange={onChange} className="!w-full" />

            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">#</span>
              <HexColorInput
                color={value}
                onChange={onChange}
                prefixed={false}
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 font-mono text-sm uppercase text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange(c)}
                  aria-label={c}
                  title={c}
                  className={cn(
                    'size-6 rounded-md border border-black/10 transition-transform hover:scale-110',
                    value.toLowerCase() === c.toLowerCase() && 'ring-2 ring-accent ring-offset-1 ring-offset-popover'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
