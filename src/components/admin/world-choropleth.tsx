'use client'

import { useMemo, useRef, useState } from 'react'

import { Flag } from '@/components/flag'
import { COUNTRY_BY_ISO2 } from '@/lib/country-codes'
import { WORLD_MAP_PATHS, WORLD_MAP_VIEWBOX } from '@/lib/world-map-paths'

type Props = {
  /** Nombre de contacts par pays, clé = code ISO2 (FR, TH…). */
  data: Record<string, number>
}

/**
 * Carte du monde « choroplèthe » : chaque pays est coloré selon le nombre de
 * contacts (du gris discret à l'orange de la marque). Survol = infobulle pays.
 * 100 % autonome (tracés SVG embarqués), aucune dépendance externe.
 */
export function WorldChoropleth({ data }: Props) {
  // Normalise les clés en minuscules pour matcher les id du SVG (fr, th…).
  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const [iso, n] of Object.entries(data)) m[iso.toLowerCase()] = n
    return m
  }, [data])

  const max = useMemo(() => Math.max(1, ...Object.values(counts)), [counts])
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  function updatePos(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const hoveredName = hoverId ? COUNTRY_BY_ISO2[hoverId.toUpperCase()]?.name : undefined
  const hoveredCount = hoverId ? counts[hoverId] ?? 0 : 0

  return (
    <div ref={containerRef} className="relative" onMouseMove={updatePos}>
      <svg
        viewBox={WORLD_MAP_VIEWBOX}
        className="h-auto w-full"
        role="img"
        aria-label="Carte des contacts par pays"
        onMouseLeave={() => setHoverId(null)}
      >
        {WORLD_MAP_PATHS.map((c) => {
          const n = counts[c.id] ?? 0
          const active = n > 0
          // Échelle douce : plus de contacts = orange plus soutenu.
          const opacity = active ? 0.35 + 0.65 * (n / max) : 0.16
          const isHover = hoverId === c.id
          return (
            <g
              key={c.id}
              onMouseEnter={() => active && setHoverId(c.id)}
              style={{ cursor: active ? 'pointer' : 'default' }}
            >
              {c.d.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  style={{
                    fill: active ? 'var(--accent)' : 'var(--muted-foreground)',
                    fillOpacity: opacity,
                    stroke: isHover ? 'var(--foreground)' : 'var(--card)',
                    strokeWidth: isHover ? 0.6 : 0.35,
                    transition: 'fill-opacity 0.15s ease',
                  }}
                />
              ))}
            </g>
          )
        })}
      </svg>

      {/* Infobulle */}
      {hoverId && hoveredName && (
        <div
          className="pointer-events-none absolute z-10 flex items-center gap-2 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, calc(-100% - 10px))' }}
        >
          <Flag iso2={hoverId.toUpperCase()} />
          <span className="font-medium text-popover-foreground">{hoveredName}</span>
          <span className="font-semibold text-accent">
            {hoveredCount} contact{hoveredCount > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Légende */}
      <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
        <span>Moins</span>
        <span className="inline-block h-2 w-6 rounded-l-sm" style={{ background: 'var(--muted-foreground)', opacity: 0.16 }} />
        <span className="inline-block h-2 w-6" style={{ background: 'var(--accent)', opacity: 0.45 }} />
        <span className="inline-block h-2 w-6 rounded-r-sm" style={{ background: 'var(--accent)' }} />
        <span>Plus</span>
      </div>
    </div>
  )
}
