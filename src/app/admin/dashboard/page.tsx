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
  Database,
  CalendarCheck,
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

export default function AdminDashboardPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/photos/tennis-aerial.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0_0/0.88)] via-[oklch(0.18_0_0/0.72)] to-[oklch(0.45_0.13_47/0.35)]" />
      </div>

      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 size-[480px] rounded-full bg-accent/20 blur-[140px]" />
        <div className="absolute -bottom-40 -right-20 size-[420px] rounded-full bg-accent/15 blur-[140px]" />
      </div>

      <div className="space-y-6 p-4 pt-12 sm:p-6 sm:pt-12 lg:p-8 lg:pt-12">
        {/* Hero Banner — glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="rounded-3xl border border-white/15 bg-white/[0.07] p-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-9 lg:p-10"
        >
          <Image
            src="/logo-light.png"
            alt="Shi Shi Samui"
            width={754}
            height={573}
            className="mb-5 h-12 w-auto"
          />
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            Espace admin
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl">
            Bonjour {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
            Gérez le contenu de votre site depuis cet espace.
          </p>
        </motion.div>

        {/* Réservations — accès prioritaire */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.04 }}
        >
          <Link
            href="/admin/bookings"
            className="group flex items-center gap-4 rounded-2xl border border-accent/40 bg-accent/15 p-5 backdrop-blur-xl transition-all hover:bg-accent/25"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-[0_10px_24px_-8px_oklch(0.63_0.187_47/0.7)]">
              <CalendarCheck className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold text-white">Réservations</p>
              <p className="text-sm text-white/70">Voir et gérer les demandes de réservation du site</p>
            </div>
            <ArrowRight className="size-5 text-white/60 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
          </Link>
        </motion.div>

        {/* Modules */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.08 }}
        >
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
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
                    className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/[0.1]"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{mod.label}</p>
                      <p className="truncate text-xs text-white/60">{mod.desc}</p>
                    </div>
                    <ArrowRight className="size-4 text-white/40 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Seed */}
        {!seedDone && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.2 }}
            className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-xl sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
                <Database className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Données d&apos;exemple</p>
                <p className="text-xs text-white/60">Ajouter des photos galerie et articles blog pour tester le template</p>
              </div>
            </div>
            <button
              onClick={async () => {
                setSeeding(true)
                try {
                  const token = localStorage.getItem('authToken')
                  const res = await fetch('/api/seed', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                  })
                  if (res.ok) {
                    setSeedDone(true)
                  } else {
                    alert('Erreur lors du seed')
                  }
                } catch {
                  alert('Erreur réseau')
                } finally {
                  setSeeding(false)
                }
              }}
              disabled={seeding}
              className="w-full shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105 disabled:opacity-50 sm:w-auto"
            >
              {seeding ? 'Chargement...' : 'Charger les données'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
