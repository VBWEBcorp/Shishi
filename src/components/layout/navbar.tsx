'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Logo } from '@/components/layout/logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { cn } from '@/lib/utils'

interface NavLink {
  to: string
  label: string
}

const defaultLinks: NavLink[] = [
  { to: '/', label: 'Accueil' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Galerie' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState<NavLink[]>(defaultLinks)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const checkFeatures = async () => {
      try {
        const [galleryRes, blogRes] = await Promise.all([
          fetch('/api/gallery/settings'),
          fetch('/api/blog/settings'),
        ])
        const gallery = await galleryRes.json()
        const blog = await blogRes.json()

        const dynamicLinks: NavLink[] = [
          { to: '/', label: 'Accueil' },
          { to: '/a-propos', label: 'À propos' },
          { to: '/services', label: 'Services' },
        ]

        if (gallery?.enabled !== false) dynamicLinks.push({ to: '/gallery', label: 'Galerie' })
        if (blog?.enabled !== false) dynamicLinks.push({ to: '/blog', label: 'Blog' })

        dynamicLinks.push({ to: '/contact', label: 'Contact' })
        setLinks(dynamicLinks)
      } catch {
        // Liens par défaut conservés en cas d'erreur
      }
    }

    checkFeatures()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        {/* Wrapper avec bordure dégradée premium */}
        <div
          className={cn(
            'relative rounded-2xl transition-all duration-500',
            scrolled
              ? 'shadow-[0_20px_50px_-20px_oklch(0.2_0.02_264/0.25),0_0_0_1px_oklch(0.55_0.2_285/0.08)]'
              : 'shadow-[0_8px_24px_-12px_oklch(0.2_0.02_264/0.12)]'
          )}
        >
          {/* Halo gradient subtil derrière la navbar quand on scroll */}
          <div
            className={cn(
              'pointer-events-none absolute -inset-x-8 -inset-y-4 -z-10 rounded-[2rem] bg-gradient-to-r from-primary/0 via-primary/[0.07] to-primary/0 blur-2xl transition-opacity duration-700',
              scrolled ? 'opacity-100' : 'opacity-0'
            )}
            aria-hidden
          />

          {/* Bordure dégradée via mask */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl p-px"
            aria-hidden
            style={{
              background:
                'linear-gradient(135deg, oklch(0.55 0.2 285 / 0.35) 0%, oklch(0.91 0.012 264 / 0.4) 35%, oklch(0.91 0.012 264 / 0.4) 65%, oklch(0.55 0.2 285 / 0.35) 100%)',
              WebkitMask:
                'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />

          <div className="flex h-14 items-center justify-between gap-2 rounded-2xl bg-background/70 pl-3 pr-1.5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 sm:pl-4">
            <Logo />

            <nav
              className="hidden items-center gap-0.5 lg:flex"
              aria-label="Navigation principale"
              onMouseLeave={() => setHoveredKey(null)}
            >
              {links.map((l) => {
                const isActive = pathname === l.to
                const isHovered = hoveredKey === l.to
                return (
                  <Link
                    key={l.to}
                    href={l.to}
                    onMouseEnter={() => setHoveredKey(l.to)}
                    className={cn(
                      'group relative whitespace-nowrap rounded-xl px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {/* Hover background qui suit la souris */}
                    {isHovered && !isActive && (
                      <motion.span
                        layoutId="nav-hover-pill"
                        className="absolute inset-0 rounded-xl bg-foreground/[0.07] ring-1 ring-foreground/[0.04]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        aria-hidden
                      />
                    )}

                    <span className={cn('relative', isActive && 'font-semibold')}>
                      {l.label}
                    </span>

                    {/* Underline fin animé sous le lien actif (style Linear/Vercel) */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-underline"
                        className="absolute inset-x-3 bottom-0.5 h-[2px] rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        aria-hidden
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5">
              <ThemeToggle />

              {/* CTA premium : gradient + shimmer + arrow */}
              <Link
                href="/contact"
                className="group/cta relative hidden h-8 items-center gap-1.5 overflow-hidden rounded-xl px-3 text-[13px] font-medium text-primary-foreground shadow-[0_4px_14px_-4px_oklch(0.48_0.22_285/0.5)] transition-all hover:shadow-[0_6px_20px_-4px_oklch(0.48_0.22_285/0.6)] active:translate-y-px sm:inline-flex"
              >
                {/* Fond gradient */}
                <span
                  className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[oklch(0.42_0.22_280)] dark:from-primary dark:via-primary dark:to-[oklch(0.65_0.18_280)]"
                  aria-hidden
                />
                {/* Shimmer animé au hover */}
                <span
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
                  aria-hidden
                />
                {/* Highlight haut */}
                <span
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  aria-hidden
                />
                <span className="relative">Nous contacter</span>
                <ArrowRight
                  className="relative size-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5"
                  aria-hidden
                />
              </Link>

              {/* Burger mobile */}
              <button
                type="button"
                className="relative inline-flex size-8 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 lg:hidden"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
                onClick={() => setOpen((v) => !v)}
              >
                <AnimatePresence initial={false} mode="wait">
                  {open ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <X className="size-5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Menu className="size-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu avec stagger animation */}
        <AnimatePresence>
          {open ? (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-2 overflow-hidden rounded-2xl bg-background/95 shadow-[0_30px_60px_-20px_oklch(0.2_0.02_264/0.25)] backdrop-blur-xl lg:hidden"
            >
              {/* Bordure dégradée mobile */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl p-px"
                aria-hidden
                style={{
                  background:
                    'linear-gradient(135deg, oklch(0.55 0.2 285 / 0.3) 0%, oklch(0.91 0.012 264 / 0.4) 50%, oklch(0.55 0.2 285 / 0.3) 100%)',
                  WebkitMask:
                    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              <div className="relative flex flex-col gap-1 p-3">
                {links.map((l, i) => {
                  const isActive = pathname === l.to
                  return (
                    <motion.div
                      key={l.to}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.22,
                        delay: 0.04 + i * 0.035,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        href={l.to}
                        className={cn(
                          'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-foreground ring-1 ring-primary/20'
                            : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <span>{l.label}</span>
                        {isActive && (
                          <span
                            className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.55_0.2_285/0.7)]"
                            aria-hidden
                          />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.24,
                    delay: 0.04 + links.length * 0.035,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-2 border-t border-border/60 pt-3"
                >
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="group/cta relative flex h-10 w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl text-sm font-medium text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.48_0.22_285/0.5)]"
                  >
                    <span
                      className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[oklch(0.42_0.22_280)] dark:to-[oklch(0.65_0.18_280)]"
                      aria-hidden
                    />
                    <span
                      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      aria-hidden
                    />
                    <span className="relative">Nous contacter</span>
                    <ArrowRight className="relative size-4" aria-hidden />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  )
}
