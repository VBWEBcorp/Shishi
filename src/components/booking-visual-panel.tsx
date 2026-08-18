'use client'

import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { activities } from '@/lib/activities'

const DEFAULT_IMAGE = '/photos/pool-panorama-portrait.webp'

/** Photo de fond correspondant à l'activité choisie (repli : piscine). */
export function activityBackground(slug?: string): string {
  return activities.find((a) => a.slug === slug)?.image || DEFAULT_IMAGE
}

/**
 * Panneau visuel du widget de réservation (DA home : sombre, photo, accent
 * orange). La photo de fond `image` change selon l'activité sélectionnée dans
 * le formulaire — passée par le conteneur. Masqué en mobile/tablette.
 */
export function BookingVisualPanel({ image }: { image: string }) {
  const t = useTranslations('Booking')
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-8 text-white lg:flex">
      {/* Fond réactif : change selon l'activité sélectionnée dans le formulaire. */}
      <Image
        src={image}
        alt=""
        fill
        sizes="40vw"
        className="object-cover opacity-70 transition-opacity duration-500"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.35)] via-[oklch(0.16_0_0/0.55)] to-[oklch(0.13_0_0/0.92)]"
        aria-hidden
      />

      <div className="relative">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
          <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
          {t('eyebrow')}
        </span>
      </div>

      <div className="relative">
        <h2 className="font-editorial text-[2rem] font-normal leading-[1.08] tracking-[-0.01em] text-white">
          {t('title')}
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">{t('subtitle')}</p>
        <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/60">
          <MapPin className="size-4" aria-hidden />
          Lamai · Koh Samui
        </p>
      </div>
    </div>
  )
}
