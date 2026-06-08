'use client'

import { ArrowUpRight, Instagram, MapPin } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { siteConfig } from '@/lib/seo'

export function Footer() {
  const t = useTranslations('Footer')
  const locale = useLocale() as Locale

  const exploreLinks = [
    { label: t('home'), to: '/' as const },
    { label: t('bookACourt'), to: '/booking' as const },
    { label: t('about'), to: '/a-propos' as const },
    { label: t('contact'), to: '/contact' as const },
  ]

  const legalLinks = [
    { label: t('legalNotice'), to: '/mentions-legales' as const },
    { label: t('privacy'), to: '/politique-de-confidentialite' as const },
    { label: t('terms'), to: '/conditions-generales' as const },
    { label: t('cookies'), to: '/politique-cookies' as const },
  ]

  return (
    <footer className="bg-[oklch(0.18_0.025_168)] text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight text-white"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-white text-[oklch(0.4_0.09_168)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden>
                  <circle cx="12" cy="9" r="3" />
                  <path d="M12 3v1M4 9H3M21 9h-1M6 4l-1-1M18 4l1-1" />
                  <path d="M3 18c1.6 0 1.6-1 3.2-1S7.8 18 9.4 18s1.6-1 3.2-1 1.6 1 3.2 1 1.6-1 3.2-1 1.6 1 3.2 1" />
                </svg>
              </span>
              Shi Shi Samui
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">{t('tagline')}</p>
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-zinc-300 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Instagram className="size-4" aria-hidden />
              @shishisamui
            </a>
          </div>

          {/* Activities */}
          <nav aria-label={t('activities')}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {t('activities')}
            </h3>
            <ul className="mt-5 space-y-3">
              {activities.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/activities/${a.slug}`}
                    className="group inline-flex items-center gap-1 text-sm text-zinc-300 transition-colors hover:text-white"
                  >
                    <span className="relative">
                      {a.name[locale]}
                      <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Explore + legal */}
          <nav aria-label={t('explore')}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {t('explore')}
            </h3>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    href={l.to}
                    className="group inline-flex items-center gap-1 text-sm text-zinc-300 transition-colors hover:text-white"
                  >
                    <span className="relative">
                      {l.label}
                      <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-5 space-y-2">
              {legalLinks.map((l) => (
                <li key={l.to}>
                  <Link href={l.to} className="text-xs text-zinc-500 transition-colors hover:text-zinc-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {t('contact')}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="group inline-flex items-center gap-1 break-all text-zinc-300 transition-colors hover:text-white"
                >
                  {siteConfig.email}
                  <ArrowUpRight className="size-3.5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
              <li className="flex items-start gap-1.5 text-zinc-500">
                <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>
                  {siteConfig.address.street}, {siteConfig.address.city}
                  <br />
                  Thailand
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10" />

        <div className="flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Shi Shi Samui. {t('rights')}
          </p>
          <p className="text-xs text-zinc-500">
            {t('craftedBy')}{' '}
            <a
              href="https://vbweb.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 underline-offset-2 transition-colors hover:text-white hover:underline"
            >
              VBWEB
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
