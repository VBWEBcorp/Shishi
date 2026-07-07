'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  Loader2,
  Lock,
  Mail,
  Star,
  Ticket,
  User as UserIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

type Mode = 'login' | 'register'

const ease = [0.22, 1, 0.36, 1] as const

/** N'autorise qu'un chemin interne (anti open-redirect), puis le préfixe de langue. */
function safeRedirect(raw: string | null, locale: string): string {
  const fallback = `/${locale}/member`
  if (!raw || raw[0] !== '/' || raw[1] === '/' || raw[1] === '\\') return fallback
  return raw === '/' ? `/${locale}` : `/${locale}${raw}`
}

export function MemberAuth() {
  const locale = useLocale() as Locale
  const fr = locale === 'fr'
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mode, setMode] = useState<Mode>('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const errorLabel = (code: string): string => {
    const map: Record<string, [string, string]> = {
      'invalid-email': ['Adresse email invalide.', 'Invalid email address.'],
      'weak-password': ['Le mot de passe doit faire au moins 6 caractères.', 'Password must be at least 6 characters.'],
      'email-taken': ['Un compte existe déjà avec cet email.', 'An account already exists with this email.'],
      'invalid-credentials': ['Identifiants incorrects.', 'Incorrect email or password.'],
      'missing-fields': ['Merci de remplir tous les champs.', 'Please fill in all fields.'],
    }
    const pair = map[code] ?? ['Une erreur est survenue.', 'Something went wrong.']
    return fr ? pair[0] : pair[1]
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/member/login' : '/api/member/register'
      const payload =
        mode === 'login'
          ? { email, password }
          : { name: `${firstName.trim()} ${lastName.trim()}`.trim(), email, password }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(errorLabel(data.error))
        return
      }
      router.push(safeRedirect(searchParams.get('redirect'), locale))
      router.refresh()
    } catch {
      setError(fr ? 'Erreur de connexion.' : 'Connection error.')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    { icon: Ticket, label: fr ? "Crédits d'activités" : 'Activity credits' },
    { icon: CalendarClock, label: fr ? "10 jours à l'avance" : '10 days ahead' },
    { icon: CalendarCheck, label: fr ? 'Déduits à la réservation' : 'Deducted at booking' },
  ]

  return (
    <section className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {/* Fond photo plein écran + voiles chauds + vignette premium */}
      <Image
        src="/photos/pool.jpg"
        alt="Shi Shi Samui — club à Lamai, Koh Samui"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[oklch(0.15_0_0/0.72)] via-[oklch(0.15_0_0/0.6)] to-[oklch(0.11_0_0/0.92)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 [background:radial-gradient(120%_80%_at_50%_28%,transparent_36%,oklch(0.1_0_0/0.55)_100%)]"
        aria-hidden
      />

      {/* Barre haute : logo (gauche) · retour au site (droite) */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Image src="/logo-light.png" alt="Shi Shi Samui" width={754} height={573} priority className="h-11 w-auto sm:h-12" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          {fr ? 'Retour au site' : 'Back to site'}
        </Link>
      </div>

      {/* Colonne centrale */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative z-10 w-full max-w-md"
      >
        {/* En-tête centré */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-accent/70" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              {fr ? 'Espace adhérent' : 'Member club'}
            </span>
            <span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-accent/70" />
          </div>
          <h1 className="mt-4 font-editorial text-[2.4rem] font-normal leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            {fr ? (
              <>Rejoignez le <span className="italic text-accent/95">club</span></>
            ) : (
              <>Join the <span className="italic text-accent/95">club</span></>
            )}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-white/75 sm:text-base">
            {fr
              ? 'Vos crédits d’activités, la réservation anticipée et votre historique — votre expérience Shi Shi.'
              : 'Your activity credits, early booking and your history — your Shi Shi experience.'}
          </p>

          {/* Avantages en ligne (chips) */}
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {benefits.map((b) => (
              <li
                key={b.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur"
              >
                <b.icon className="size-3.5 text-accent" aria-hidden />
                {b.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Carte formulaire (verre dépoli) */}
        <div className="mt-7 rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8">
          {/* Bascule connexion / inscription */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                className={`relative h-10 rounded-full text-sm font-semibold transition-colors ${
                  mode === m ? 'text-accent-foreground' : 'text-white/70 hover:text-white'
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-toggle"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-accent shadow-[0_8px_20px_-8px_oklch(0.63_0.187_47/0.7)]"
                  />
                )}
                <span className="relative">
                  {m === 'login' ? (fr ? 'Connexion' : 'Sign in') : (fr ? 'Inscription' : 'Sign up')}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label={fr ? 'Prénom' : 'First name'} icon={UserIcon}>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    placeholder={fr ? 'Prénom' : 'First name'}
                    className={inputCls}
                  />
                </Field>
                <Field label={fr ? 'Nom' : 'Last name'} icon={UserIcon}>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    placeholder={fr ? 'Nom' : 'Last name'}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}

            <Field label="Email" icon={Mail}>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="vous@email.com"
                className={inputCls}
              />
            </Field>

            <Field label={fr ? 'Mot de passe' : 'Password'} icon={Lock}>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                placeholder="••••••••"
                className={inputCls}
              />
            </Field>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-100"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="group h-12 w-full rounded-xl bg-accent text-accent-foreground shadow-[0_12px_30px_-10px_oklch(0.63_0.187_47/0.6)] transition-all hover:brightness-105"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <>
                  {mode === 'login'
                    ? fr ? 'Se connecter' : 'Sign in'
                    : fr ? 'Créer mon compte' : 'Create account'}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </>
              )}
            </Button>
          </form>

          {/* Réserver sans compte */}
          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/15" />
            <span className="text-xs font-medium uppercase tracking-wide text-white/50">{fr ? 'ou' : 'or'}</span>
            <span className="h-px flex-1 bg-white/15" />
          </div>
          <Link
            href="/book-now"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {fr ? 'Réserver sans compte' : 'Book without an account'}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {/* Preuve sociale + mention légale */}
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
              ))}
            </span>
            <span className="text-xs font-semibold text-white">{fr ? '5,0 sur Google' : '5.0 on Google'}</span>
          </span>
          <p className="text-[11px] leading-relaxed text-white/45">
            {fr ? 'En continuant, vous acceptez nos ' : 'By continuing, you agree to our '}
            <Link href="/politique-de-confidentialite" className="underline underline-offset-2 hover:text-white/80">
              {fr ? 'conditions et politique de confidentialité' : 'terms & privacy policy'}
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </section>
  )
}

const inputCls =
  'h-12 rounded-xl border-white/15 bg-white/10 pl-11 text-white placeholder:text-white/40 focus:border-white/30 focus-visible:border-white/40 focus-visible:shadow-[0_0_0_4px_rgba(255,255,255,0.08)]'

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-white/70">{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/50" />
        {children}
      </div>
    </div>
  )
}
