'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Mail, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ease = [0.22, 1, 0.36, 1] as const

/** Petit séparateur losange repris du logo (── ◆ ──) — motif signature de la DA. */
function DiamondRule() {
  return (
    <div className="mt-5 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/45" />
      <span className="size-1.5 rotate-45 bg-accent" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/45" />
    </div>
  )
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Identifiants invalides')
      }

      const data = await response.json()
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data.user))

      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.16_0_0)]">
      {/* Background image + voile neutre (DA hero : sombre, sans teinte chaude appuyée) */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/photos/pool.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.6)] via-[oklch(0.16_0_0/0.66)] to-[oklch(0.13_0_0/0.92)]" />
        {/* Vignette douce pour recentrer le regard */}
        <div className="absolute inset-0 bg-[radial-gradient(115%_80%_at_50%_0%,transparent_35%,oklch(0.11_0_0/0.6))]" />
      </div>

      {/* Halo d'ambiance orange — discret, un seul foyer chaud */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-accent/15 blur-[150px]" />
      </div>

      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowRight className="size-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Retour au site
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/85 ring-1 ring-white/15 backdrop-blur">
            <Shield className="size-3.5 text-accent" aria-hidden />
            <span className="hidden sm:inline">Connexion sécurisée</span>
            <span className="sm:hidden">Sécurisé</span>
          </span>
        </header>

        {/* Centered content */}
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="w-full max-w-md"
          >
            {/* Title block — typo éditoriale, dernier mot en italique orange (signature DA) */}
            <div className="mb-8 text-center sm:mb-10">
              <Image
                src="/logo-light.png"
                alt="Shi Shi Samui"
                width={754}
                height={573}
                priority
                className="mx-auto mb-7 h-16 w-auto"
              />
              <h1 className="font-editorial text-4xl font-normal leading-[1.05] tracking-[-0.01em] text-white sm:text-[2.9rem]">
                Espace <span className="italic text-accent/95">admin</span>
              </h1>
              <DiamondRule />
              <p className="mt-5 text-sm text-white/65">
                Connectez-vous pour gérer le contenu du site
              </p>
            </div>

            {/* Glassmorphism card — hairline lumineuse en haut (finition premium) */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-6 shadow-[0_40px_80px_-28px_rgba(0,0,0,0.7)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:content-[''] sm:p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                    Email
                  </Label>
                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/45 transition-colors group-focus-within:text-accent" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="vous@exemple.com"
                      className="h-11 rounded-xl border-white/12 bg-white/[0.06] pl-11 text-white placeholder:text-white/35 focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/25"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                    Mot de passe
                  </Label>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/45 transition-colors group-focus-within:text-accent" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-11 rounded-xl border-white/12 bg-white/[0.06] pl-11 text-white placeholder:text-white/35 focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/25"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-100"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-xl bg-accent font-semibold text-accent-foreground shadow-[0_16px_32px_-12px_oklch(0.63_0.187_47/0.8)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
                >
                  {loading ? (
                    'Connexion en cours…'
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 text-center sm:px-10 sm:py-8">
          <Link
            href="/politique-de-confidentialite"
            className="text-[11px] text-white/45 transition-colors hover:text-white/75"
          >
            Politique de confidentialité
          </Link>
        </footer>
      </div>
    </div>
  )
}
