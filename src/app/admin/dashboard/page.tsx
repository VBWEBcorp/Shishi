'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Home,
  Users,
  Briefcase,
  Phone,
  MessageSquare,
  Images,
  ArrowRight,
  FileText,
  CalendarCheck,
  CreditCard,
} from 'lucide-react'

interface AdminUser {
  email: string
  name?: string
}

const modules = [
  { href: '/admin/pages/accueil', label: 'Accueil', desc: 'Hero, histoire, CTA, bandeau', icon: Home },
  { href: '/admin/pages/a-propos', label: 'À propos', desc: 'Présentation, valeurs, galerie', icon: Users },
  { href: '/admin/pages/services', label: 'Services', desc: 'Liste des services', icon: Briefcase },
  { href: '/admin/pages/contact', label: 'Contact', desc: 'Formulaire, coordonnées', icon: Phone },
  { href: '/admin/pages/temoignages', label: 'Témoignages', desc: 'Avis clients', icon: MessageSquare },
  { href: '/admin/gallery', label: 'Galerie', desc: 'Photos du site', icon: Images },
  { href: '/admin/blog', label: 'Blog', desc: 'Articles et actualités', icon: FileText },
]

const ease = [0.22, 1, 0.36, 1] as const

/** Séparateur losange repris du logo (── ◆ ──) — motif signature de la DA. */
function DiamondRule() {
  return (
    <div className="mt-5 flex items-center gap-3" aria-hidden>
      <span className="size-1.5 rotate-45 bg-accent" />
      <span className="h-px w-16 bg-gradient-to-r from-accent/60 to-transparent" />
    </div>
  )
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('authUser')

    if (!token || !userStr) {
      router.push('/admin/login')
      return
    }

    try {
      setUser(JSON.parse(userStr))
    } catch {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading || !user) return null

  const firstName = user.name?.split(' ')[0] || 'admin'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.16_0_0)]">
      {/* Background image + voile neutre (même DA que le hero du site) */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/photos/pool.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.72)] via-[oklch(0.16_0_0/0.8)] to-[oklch(0.13_0_0/0.94)]" />
      </div>

      {/* Halo d'ambiance orange — discret */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 size-[480px] rounded-full bg-accent/15 blur-[150px]" />
        <div className="absolute -bottom-40 -right-24 size-[420px] rounded-full bg-accent/10 blur-[150px]" />
      </div>

      <div className="mx-auto max-w-5xl space-y-6 p-4 pt-16 sm:p-6 sm:pt-16 md:pt-6 lg:p-8 lg:pt-8">
        {/* Hero Banner — glassmorphism, hairline lumineuse en haut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-7 shadow-[0_40px_80px_-28px_rgba(0,0,0,0.7)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:content-[''] sm:p-9 lg:p-10"
        >
          <Image
            src="/logo-light.png"
            alt="Shi Shi Samui"
            width={754}
            height={573}
            className="mb-6 h-12 w-auto"
          />
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/85 ring-1 ring-white/15 backdrop-blur">
            <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
            Espace admin
          </span>
          <h1 className="mt-4 font-editorial text-3xl font-normal leading-[1.05] tracking-[-0.01em] text-white sm:text-4xl lg:text-[2.9rem]">
            Bonjour <span className="italic text-accent/95">{firstName}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/65 sm:text-base">
            Gérez le contenu de votre site depuis cet espace.
          </p>
          <DiamondRule />
        </motion.div>

        {/* Accès prioritaires — réservations & crédits des membres (jour J) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.04 }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <Link
            href="/admin/bookings"
            className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-accent/40 bg-accent/[0.14] p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/25"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-[0_14px_28px_-10px_oklch(0.63_0.187_47/0.85)]">
              <CalendarCheck className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold text-white">Réservations</p>
              <p className="text-sm text-white/65">Voir et gérer les demandes de réservation</p>
            </div>
            <ArrowRight className="size-5 text-white/55 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
          </Link>

          <Link
            href="/admin/members"
            className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.1]"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
              <CreditCard className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold text-white">Adhérents &amp; crédits</p>
              <p className="text-sm text-white/65">Créditer les adhérents par activité (jour J)</p>
            </div>
            <ArrowRight className="size-5 text-white/55 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
          </Link>
        </motion.div>

        {/* Modules */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.08 }}
        >
          <h2 className="mb-4 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
            Éditer les pages
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod, i) => {
              const Icon = mod.icon
              return (
                <motion.div
                  key={mod.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease, delay: 0.1 + i * 0.04 }}
                >
                  <Link
                    href={mod.href}
                    className="group flex h-full items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.05] p-4 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.09]"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.08] text-white transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{mod.label}</p>
                      <p className="truncate text-xs text-white/55">{mod.desc}</p>
                    </div>
                    <ArrowRight className="size-4 text-white/35 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
