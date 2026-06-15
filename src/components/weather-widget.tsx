'use client'

import { Cloud, CloudRain, CloudSun, Sun, Zap } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

import type { Locale } from '@/i18n/routing'
import { siteConfig } from '@/lib/seo'
import { cn } from '@/lib/utils'

interface Weather {
  temp: number
  code: number
}

type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'storm' | 'rain' | 'mild'

const LABELS: Record<WeatherKind, Record<Locale, string>> = {
  clear: { en: 'Clear', fr: 'Dégagé' },
  partly: { en: 'Partly cloudy', fr: 'Peu nuageux' },
  cloudy: { en: 'Cloudy', fr: 'Nuageux' },
  storm: { en: 'Storm', fr: 'Orage' },
  rain: { en: 'Rain', fr: 'Pluie' },
  mild: { en: 'Mild', fr: 'Variable' },
}

// Mapping WMO weather code → icône + type (open-meteo)
function describe(code: number): { Icon: typeof Sun; kind: WeatherKind } {
  if (code === 0) return { Icon: Sun, kind: 'clear' }
  if (code <= 2) return { Icon: CloudSun, kind: 'partly' }
  if (code === 3) return { Icon: Cloud, kind: 'cloudy' }
  if (code >= 95) return { Icon: Zap, kind: 'storm' }
  if (code >= 51) return { Icon: CloudRain, kind: 'rain' }
  return { Icon: CloudSun, kind: 'mild' }
}

/**
 * Météo en direct de Lamai (Koh Samui) via open-meteo — sans clé API.
 * Demandé par le client ("Affichage des informations météo").
 */
export function WeatherWidget({ className }: { className?: string }) {
  const locale = useLocale() as Locale
  const [weather, setWeather] = useState<Weather | null>(null)

  useEffect(() => {
    const { lat, lon } = siteConfig.geo
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia%2FBangkok`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d?.current) {
          setWeather({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code })
        }
      })
      .catch(() => {})
  }, [])

  if (!weather) return null

  const { Icon, kind } = describe(weather.code)
  const label = LABELS[kind][locale]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-2 text-white ring-1 ring-white/20 backdrop-blur',
        className
      )}
    >
      <Icon className="size-5 text-accent" aria-hidden />
      <span className="text-sm font-semibold">{weather.temp}°C</span>
      <span className="text-xs text-white/70">{label} · Lamai</span>
    </div>
  )
}
