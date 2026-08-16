'use client'

import { useEffect, useMemo, useState } from 'react'

import { formatDuration, isDayPass, toHHMM, toMinutes } from '@/lib/availability'
import { cn } from '@/lib/utils'

/**
 * Forme minimale attendue d'une réservation. Volontairement structurelle : la
 * page passe ses objets complets sans qu'on ait à partager un type entre les
 * deux fichiers.
 */
export interface AgendaBooking {
  _id: string
  activitySlug: string
  activityName: string
  date: string
  time: string
  duration: number
  name: string
  status: 'pending' | 'paid' | 'cancelled' | 'failed'
  blocked?: boolean
}

/** Hauteur d'une heure, en pixels. Une demi-heure reste donc bien lisible. */
const HOUR_PX = 56
/** Amplitude affichée par défaut, élargie si des réservations débordent. */
const DEFAULT_START_HOUR = 7
const DEFAULT_END_HOUR = 21

const GRID_COLS = 'grid-cols-[3.25rem_repeat(7,minmax(0,1fr))]'

const WEEKDAY_LABEL = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

/** Couleur du bloc selon l'état de la réservation. */
function blockTone(b: AgendaBooking): string {
  if (b.blocked) {
    return 'border-zinc-400 bg-zinc-400/20 text-zinc-700 dark:text-zinc-200'
  }
  switch (b.status) {
    case 'paid':
      return 'border-emerald-500 bg-emerald-500/15 text-emerald-900 hover:bg-emerald-500/25 dark:text-emerald-100'
    case 'pending':
      return 'border-orange-500 bg-orange-500/15 text-orange-900 hover:bg-orange-500/25 dark:text-orange-100'
    case 'cancelled':
      return 'border-zinc-400 bg-zinc-400/10 text-zinc-500 line-through dark:text-zinc-400'
    default:
      return 'border-red-500 bg-red-500/15 text-red-900 hover:bg-red-500/25 dark:text-red-100'
  }
}

function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

interface Placed {
  b: AgendaBooking
  start: number
  end: number
  lane: number
  lanes: number
}

/**
 * Répartit en colonnes côte à côte les réservations qui se chevauchent (deux
 * terrains de tennis sur la même heure), pour qu'aucune n'en masque une autre.
 */
function packLanes(items: AgendaBooking[]): Placed[] {
  const sorted = [...items]
    .map((b) => ({ b, start: toMinutes(b.time), end: toMinutes(b.time) + (b.duration || 60) }))
    .sort((x, y) => x.start - y.start || x.end - y.end)

  const placed: (Placed & { group: number })[] = []
  const laneEnds: number[] = []
  let group = 0
  let groupEnd = -1

  for (const it of sorted) {
    // Un départ après la fin du groupe courant ouvre un nouveau groupe : on
    // repart sur une seule colonne pleine largeur.
    if (it.start >= groupEnd) {
      group++
      laneEnds.length = 0
      groupEnd = it.end
    } else {
      groupEnd = Math.max(groupEnd, it.end)
    }
    let lane = laneEnds.findIndex((end) => end <= it.start)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(it.end)
    } else {
      laneEnds[lane] = it.end
    }
    placed.push({ ...it, lane, lanes: 1, group })
  }

  // Largeur commune à tout le groupe : les blocs restent alignés entre eux.
  const widths = new Map<number, number>()
  for (const p of placed) widths.set(p.group, Math.max(widths.get(p.group) ?? 1, p.lane + 1))
  return placed.map((p) => ({ ...p, lanes: widths.get(p.group) ?? 1 }))
}

/**
 * Vue « semaine » en timeline : les jours en colonnes, les heures en lignes, et
 * chaque réservation posée à sa place exacte et à sa vraie durée. C'est la vue
 * qui rend les demi-heures immédiatement lisibles — une séance 07:30 → 09:00
 * s'y voit comme un bloc d'une heure et demie, pas comme une ligne de texte.
 */
export function WeekAgenda({
  days,
  byDay,
  selectedDay,
  todayKey,
  onSelectDay,
  onCreate,
}: {
  /** Les 7 jours affichés, du lundi au dimanche. */
  days: Date[]
  /** Réservations groupées par date "AAAA-MM-JJ". */
  byDay: Map<string, AgendaBooking[]>
  selectedDay: string
  todayKey: string
  onSelectDay: (key: string) => void
  /** Clic sur une zone libre : créer une réservation ce jour-là. */
  onCreate: (key: string) => void
}) {
  // Trait « maintenant » : uniquement côté client, pour ne pas désynchroniser
  // le rendu serveur.
  const [nowMinutes, setNowMinutes] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setNowMinutes(d.getHours() * 60 + d.getMinutes())
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  const keys = useMemo(() => days.map(ymd), [days])

  // Réservations à l'heure (posées dans la grille) vs accès à la journée
  // (bandeau du haut : un pass piscine ne doit pas écraser la journée entière).
  const timed = useMemo(
    () => keys.map((k) => (byDay.get(k) ?? []).filter((b) => !isDayPass(b.activitySlug))),
    [keys, byDay]
  )
  const allDay = useMemo(
    () => keys.map((k) => (byDay.get(k) ?? []).filter((b) => isDayPass(b.activitySlug))),
    [keys, byDay]
  )
  const hasAllDay = allDay.some((list) => list.length > 0)

  // Amplitude affichée : on part de 07:00–21:00 et on élargit si besoin.
  const { startHour, endHour } = useMemo(() => {
    let min = DEFAULT_START_HOUR * 60
    let max = DEFAULT_END_HOUR * 60
    for (const list of timed) {
      for (const b of list) {
        const s = toMinutes(b.time)
        min = Math.min(min, s)
        max = Math.max(max, s + (b.duration || 60))
      }
    }
    const from = Math.floor(min / 60)
    return { startHour: from, endHour: Math.max(Math.ceil(max / 60), from + 1) }
  }, [timed])

  const hours = useMemo(
    () => Array.from({ length: endHour - startHour }, (_, i) => startHour + i),
    [startHour, endHour]
  )
  const gridHeight = hours.length * HOUR_PX
  const offsetOf = (minutes: number) => ((minutes - startHour * 60) / 60) * HOUR_PX

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[46rem]">
        {/* En-tête : les jours, cliquables */}
        <div className={cn('grid border-b border-border', GRID_COLS)}>
          <div />
          {days.map((d, i) => {
            const key = keys[i]
            const isToday = key === todayKey
            const isSelected = key === selectedDay
            const count = (byDay.get(key) ?? []).length
            return (
              <button
                key={key}
                onClick={() => onSelectDay(key)}
                className={cn(
                  'flex flex-col items-center gap-0.5 border-l border-border/60 py-2 transition-colors',
                  isSelected ? 'bg-accent/10' : 'hover:bg-muted/50'
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {WEEKDAY_LABEL[i]}
                </span>
                <span
                  className={cn(
                    'inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold',
                    isToday ? 'bg-accent text-accent-foreground' : 'text-foreground'
                  )}
                >
                  {d.getDate()}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {count > 0 ? `${count} résa${count > 1 ? 's' : ''}` : '—'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bandeau « accès journée » (piscine, salle de sport) */}
        {hasAllDay && (
          <div className={cn('grid border-b border-border bg-muted/20', GRID_COLS)}>
            <div className="py-2 pr-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Journée
            </div>
            {allDay.map((list, i) => (
              <div key={keys[i]} className="space-y-1 border-l border-border/60 p-1">
                {list.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => onSelectDay(b.date)}
                    title={`${b.activityName} · ${b.name}`}
                    className={cn(
                      'block w-full truncate rounded border-l-[3px] px-1.5 py-0.5 text-left text-[10px] font-medium',
                      blockTone(b)
                    )}
                  >
                    {b.activityName}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Grille horaire */}
        <div className={cn('relative grid', GRID_COLS)}>
          {/* Colonne des heures */}
          <div className="relative" style={{ height: gridHeight }}>
            {hours.map((h, i) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[11px] font-medium tabular-nums text-muted-foreground"
                style={{ top: i * HOUR_PX }}
              >
                {String(h).padStart(2, '0')}:00
              </span>
            ))}
          </div>

          {days.map((d, i) => {
            const key = keys[i]
            const isSelected = key === selectedDay
            return (
              <div
                key={key}
                className={cn(
                  'relative border-l border-border/60',
                  isSelected && 'bg-accent/[0.04]'
                )}
                style={{ height: gridHeight }}
              >
                {/* Lignes de fond : trait plein à l'heure, pointillé à la demi */}
                {hours.map((h, hi) => (
                  <div key={h}>
                    <div
                      className="pointer-events-none absolute inset-x-0 border-t border-border/60"
                      style={{ top: hi * HOUR_PX }}
                    />
                    <div
                      className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/35"
                      style={{ top: hi * HOUR_PX + HOUR_PX / 2 }}
                    />
                  </div>
                ))}

                {/* Zone libre : un clic crée une réservation ce jour-là.
                    Déclarée avant les blocs → elle reste dessous. */}
                <button
                  type="button"
                  onClick={() => onCreate(key)}
                  aria-label={`Ajouter une réservation le ${key}`}
                  className="absolute inset-0 cursor-copy"
                />

                {/* Trait « maintenant » */}
                {key === todayKey &&
                  nowMinutes !== null &&
                  nowMinutes >= startHour * 60 &&
                  nowMinutes <= endHour * 60 && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-accent"
                      style={{ top: offsetOf(nowMinutes) }}
                    >
                      <span className="absolute -left-0.5 -top-1 size-2 rounded-full bg-accent" aria-hidden />
                    </div>
                  )}

                {/* Réservations */}
                {packLanes(timed[i]).map(({ b, start, end, lane, lanes }) => {
                  const top = offsetOf(start)
                  const height = Math.max(20, ((end - start) / 60) * HOUR_PX - 2)
                  const duration = end - start
                  return (
                    <button
                      key={b._id}
                      onClick={() => onSelectDay(b.date)}
                      title={`${b.time} → ${toHHMM(end)} · ${formatDuration(duration)} · ${b.activityName}${b.blocked ? '' : ` · ${b.name}`}`}
                      className={cn(
                        'absolute overflow-hidden rounded-md border-l-[3px] px-1.5 py-0.5 text-left leading-tight shadow-sm transition-shadow hover:shadow-md',
                        blockTone(b)
                      )}
                      style={{
                        top,
                        height,
                        left: `calc(${(lane / lanes) * 100}% + 2px)`,
                        width: `calc(${100 / lanes}% - 4px)`,
                      }}
                    >
                      <span className="block truncate text-[11px] font-semibold tabular-nums">
                        {b.time} – {toHHMM(end)}
                      </span>
                      {height >= 38 && (
                        <span className="block truncate text-[10px] font-medium opacity-90">
                          {b.blocked ? 'Créneau bloqué' : b.name}
                        </span>
                      )}
                      {height >= 58 && (
                        <span className="block truncate text-[10px] opacity-70">{b.activityName}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
