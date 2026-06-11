'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Globe, Instagram, MapPin } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState, useTransition } from 'react'

import { ActivityIcon } from '@/components/activity-icon'
import { Logo } from '@/components/layout/logo'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import { activities, serviceConfigs } from '@/lib/activities'
import { siteConfig } from '@/lib/seo'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/book-now', key: 'book' },
  { to: '/a-propos', key: 'about' },
  { to: '/contact-location', key: 'contact' },
] as const

export function Navbar() {
  const t = useTranslations('Nav')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const hasDarkHero =
    pathname === '/' ||
    serviceConfigs.some((s) => pathname === s.path) ||
    pathname?.startsWith('/book-now') ||
    pathname?.startsWith('/contact-location') ||
    pathname?.startsWith('/a-propos')
  const lightText = open || (!!hasDarkHero && !scrolled)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[110] transition-colors duration-500',
          !open && scrolled
            ? 'border-b border-border bg-background/80 backdrop-blur-xl'
            : 'border-b border-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo light={lightText} />

          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitch light={lightText} />

            <Link
              href="/book-now"
              className={cn(
                'hidden h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-all sm:inline-flex',
                lightText
                  ? 'bg-white/15 text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/25'
                  : 'bg-accent text-accent-foreground shadow-[0_6px_18px_-6px_oklch(0.63_0.187_47/0.55)] hover:brightness-105',
                open && 'pointer-events-none opacity-0'
              )}
            >
              {t('bookNow')}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? t('close') : t('menu')}
              className={cn(
                'group inline-flex items-center gap-2.5 rounded-full py-2 pl-4 pr-3 text-[13px] font-semibold uppercase tracking-wide transition-colors',
                lightText ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-foreground/[0.06]'
              )}
            >
              <span>{open ? t('close') : t('menu')}</span>
              <span className="relative flex h-4 w-7 flex-col justify-center gap-[7px]">
                <motion.span
                  animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={cn('h-px w-full', lightText ? 'bg-white' : 'bg-foreground')}
                />
                <motion.span
                  animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={cn('h-px w-full', lightText ? 'bg-white' : 'bg-foreground')}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <FullscreenMenu open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  )
}

function FullscreenMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean
  onClose: () => void
  pathname: string
}) {
  const t = useTranslations('Nav')
  const locale = useLocale() as Locale

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] overflow-hidden"
        >
          {/* Verre dépoli : on floute le contenu RÉEL de la page derrière le menu
              (backdrop-blur), comme la réf. Traavellio — pas une image figée. */}
          <div
            className="pointer-events-none absolute inset-0 backdrop-blur-[28px] [backdrop-filter:blur(28px)_saturate(1.1)]"
            aria-hidden
          >
            <div className="absolute inset-0 bg-[oklch(0.2_0.008_240/0.52)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.35)] via-transparent to-[oklch(0.13_0_0/0.62)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.32 }}
            className="relative mx-auto flex h-dvh max-w-7xl flex-col overflow-y-auto px-4 sm:px-6 lg:overflow-hidden lg:px-8"
          >
            <div className="h-16 shrink-0" aria-hidden />

            <nav className="flex flex-1 flex-col justify-center py-6 lg:py-8" aria-label="Activities">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
                {t('ourActivities')}
              </p>
              <ul className="border-t border-white/10">
                {activities.map((a) => {
                  const active = pathname === a.path
                  return (
                    <li key={a.slug} className="border-b border-white/10">
                      <Link
                        href={a.path}
                        onClick={onClose}
                        className="group flex items-center gap-4 py-2.5 sm:py-3 lg:py-2.5"
                      >
                        <ActivityIcon
                          name={a.icon}
                          className="size-5 shrink-0 text-white/50 transition-colors group-hover:text-accent sm:size-6"
                        />
                        <span
                          className={cn(
                            'font-editorial text-[1.7rem] font-normal leading-tight tracking-[-0.01em] transition-colors duration-200 group-hover:text-white sm:text-4xl lg:text-[2.5rem]',
                            active ? 'text-white' : 'text-white/65'
                          )}
                        >
                          {a.name[locale]}
                        </span>
                        {a.featured && (
                          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent ring-1 ring-accent/25">
                            Signature
                          </span>
                        )}
                        <span className="ml-auto hidden truncate text-sm text-white/45 md:block">
                          {a.tagline[locale]}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Bas : contact (gauche) · liens + CTA + réseaux (droite) */}
            <div className="flex shrink-0 flex-col gap-6 border-t border-white/10 py-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
                  {t('getInTouch')}
                </p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="mt-2 block w-fit border-b border-white/20 pb-0.5 text-base text-white/85 transition-colors hover:border-white/60 hover:text-white"
                >
                  {siteConfig.email}
                </a>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/45">
                  <MapPin className="size-4" aria-hidden />
                  Lamai · Koh Samui
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:items-end">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {navItems.map((l) => (
                    <Link
                      key={l.to}
                      href={l.to}
                      onClick={onClose}
                      className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                    >
                      {t(l.key)}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={siteConfig.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex size-10 items-center justify-center rounded-full text-white/70 ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Instagram className="size-4" aria-hidden />
                  </a>
                  <Link
                    href="/book-now"
                    onClick={onClose}
                    className="group inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.6)] transition-all hover:brightness-105"
                  >
                    {t('bookACourt')}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Libellés de langue affichés dans le popover (code pays + nom + région). */
const LANG_META: Record<Locale, { code: string; name: string; region: string }> = {
  fr: { code: 'FR', name: 'Français', region: 'France' },
  en: { code: 'GB', name: 'English', region: 'International' },
}

/** Sélecteur de langue (next-intl) — popover discret ancré sous le déclencheur. */
function LangSwitch({ light }: { light?: boolean }) {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const switchTo = (next: Locale) => {
    setOpen(false)
    if (next === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ring-1 transition-colors',
          light
            ? 'text-white/90 ring-white/15 hover:bg-white/10'
            : 'text-foreground ring-border hover:bg-foreground/[0.06]',
          isPending && 'opacity-60'
        )}
      >
        <Globe className="size-3.5" aria-hidden />
        {locale}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Langue"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-60 origin-top-right overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-[0_6px_16px_-10px_oklch(0.16_0.02_55/0.3)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 ease-out"
        >
          {routing.locales.map((l) => {
            const m = LANG_META[l]
            const active = locale === l
            return (
              <button
                key={l}
                type="button"
                onClick={() => switchTo(l)}
                disabled={isPending}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                  active ? 'bg-secondary/70' : 'hover:bg-secondary/60'
                )}
                aria-pressed={active}
              >
                <span className="w-7 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {m.code}
                </span>
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-semibold text-foreground">{m.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{m.region}</span>
                </span>
                {active && <Check className="size-4 shrink-0 text-accent" aria-hidden />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
