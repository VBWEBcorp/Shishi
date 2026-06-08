'use client'

import { Cloud, CloudRain, CloudSun, Sun, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

import { siteConfig } from '@/lib/seo'
import { cn } from '@/lib/utils'

interface Weather {
  temp: number
  code: number
}

// Mapping WMO weather code → icône + libellé (open-meteo)
function describe(code: number): { Icon: typeof Sun; label: string } {
  if (code === 0) return { Icon: Sun, label: 'Clear' }
  if (code <= 2) return { Icon: CloudSun, label: 'Partly cloudy' }
  if (code === 3) return { Icon: Cloud, label: 'Cloudy' }
  if (code >= 95) return { Icon: Zap, label: 'Storm' }
  if (code >= 51) return { Icon: CloudRain, label: 'Rain' }
  return { Icon: CloudSun, label: 'Mild' }
}

/**
 * Météo en direct de Lamai (Koh Samui) via open-meteo — sans clé API.
 * Demandé par le client ("Affichage des informations météo").
 */
export function WeatherWidget({ className }: { className?: string }) {
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

  const { Icon, label } = describe(weather.code)

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
