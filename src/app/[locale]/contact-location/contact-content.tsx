'use client'

import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Facebook,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Send,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { PremiumHero } from '@/components/sections/premium-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/navigation'
import { activities, resolveLink } from '@/lib/activities'
import type { Locale } from '@/lib/activities'
import { OPENING_HOURS } from '@/lib/booking-pricing'
import { mapsDirectionsUrl, mapsEmbedUrl, siteConfig } from '@/lib/seo'
import { images as siteImages } from '@/lib/site-content'

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

const FORMSPREE_RAW = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || ''
const FORMSPREE_ENDPOINT = FORMSPREE_RAW.startsWith('http')
  ? FORMSPREE_RAW
  : FORMSPREE_RAW
    ? `https://formspree.io/f/${FORMSPREE_RAW}`
    : ''

export function ContactContent() {
  const t = useTranslations('Contact')
  const l = useLocale() as Locale
  const [status, setStatus] = useState<FormStatus>('idle')

  const phoneHref = `tel:${siteConfig.phone.replace(/\s/g, '')}`
  const waLink = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    t('whatsappPrefill')
  )}`

  const tennis = activities.find((a) => a.slug === 'tennis')!
  const fitness = activities.find((a) => a.slug === 'fitness')!
  const kids = activities.find((a) => a.slug === 'kids-club')!
  const pool = activities.find((a) => a.slug === 'pool')!
  const hoursRows = [
    { name: `${tennis.name[l]} & ${fitness.name[l]}`, hours: OPENING_HOURS.tennis[l] },
    { name: kids.name[l], hours: OPENING_HOURS['kids-club'][l] },
    { name: pool.name[l], hours: OPENING_HOURS.pool[l] },
  ]

  const internal = ['home', 'prices', 'book-now']
    .map((token) => resolveLink(token, l))
    .filter((x): x is { href: string; label: string } => x !== null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return
    if (!FORMSPREE_ENDPOINT) {
      setStatus('error')
      return
    }
    const form = e.currentTarget
    const fd = new FormData(form)
    setStatus('sending')
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd,
      })
      if (!res.ok) throw new Error('request-failed')
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <PremiumHero
        eyebrow={t('eyebrow')}
        title={t('h1')}
        description={t('description')}
        breadcrumb={t('breadcrumb')}
        compact
        backgroundImage={siteImages.contactHero}
      >
        {/* CTA contact rapides — WhatsApp prioritaire (visible mobile) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,0.6)] transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="size-4" aria-hidden /> {t('whatsapp')}
          </a>
          <a
            href={phoneHref}
            className="inline-flex items-center gap-2 rounded-full bg-white/12 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/20"
          >
            <Phone className="size-4" aria-hidden /> {t('call')}
          </a>
        </div>
      </PremiumHero>

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* Coordonnées + horaires + accès (NAP local SEO) */}
            <div className="space-y-5">
              <div className="rounded-3xl border border-border bg-card p-7">
                <h2 className="font-editorial text-xl font-medium text-foreground">{t('reach')}</h2>
                <ul className="mt-5 space-y-4">
                  <li>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/12 text-[#1d9e4f]">
                        <MessageCircle className="size-4" aria-hidden />
                      </span>
                      <span>
                        <span className="block text-xs font-medium text-muted-foreground">WhatsApp</span>
                        <span className="block text-sm font-semibold text-foreground">{t('whatsapp')}</span>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a href={phoneHref} className="group flex items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-ocean">
                        <Phone className="size-4" aria-hidden />
                      </span>
                      <span>
                        <span className="block text-xs font-medium text-muted-foreground">{t('call')}</span>
                        <span className="block text-sm font-semibold text-foreground">{siteConfig.phone}</span>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${siteConfig.email}`} className="group flex items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-ocean">
                        <Mail className="size-4" aria-hidden />
                      </span>
                      <span>
                        <span className="block text-xs font-medium text-muted-foreground">{t('email')}</span>
                        <span className="block break-all text-sm font-semibold text-foreground">{siteConfig.email}</span>
                      </span>
                    </a>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-ocean">
                      <MapPin className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-xs font-medium text-muted-foreground">{t('addressTitle')}</span>
                      <span className="block text-sm font-semibold text-foreground">
                        {siteConfig.name}
                        <br />
                        {siteConfig.address.street}, {siteConfig.address.city}
                        <br />
                        {siteConfig.address.region} {siteConfig.address.postalCode}, Thailand
                      </span>
                    </span>
                  </li>
                </ul>

                {/* Réseaux sociaux (NAP cohérent) */}
                <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {t('followUs')}
                  </span>
                  <a
                    href={siteConfig.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="grid size-10 place-items-center rounded-xl text-foreground ring-1 ring-border transition-colors hover:bg-foreground/[0.06]"
                  >
                    <Instagram className="size-4" aria-hidden />
                  </a>
                  <a
                    href={siteConfig.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="grid size-10 place-items-center rounded-xl text-foreground ring-1 ring-border transition-colors hover:bg-foreground/[0.06]"
                  >
                    <Facebook className="size-4" aria-hidden />
                  </a>
                </div>
              </div>

              {/* Horaires confirmés (charte) + accès */}
              <div className="rounded-3xl border border-border bg-card p-7">
                <h2 className="flex items-center gap-2 font-editorial text-xl font-medium text-foreground">
                  <Clock className="size-5 text-accent" aria-hidden /> {t('hoursTitle')}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {hoursRows.map((r) => (
                    <li key={r.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">{r.name}</span>
                      <span className="font-medium text-foreground">{r.hours}</span>
                    </li>
                  ))}
                </ul>
                <h3 className="mt-6 text-sm font-semibold text-foreground">{t('findUs')}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('findUsText')}</p>
                <p className="mt-2 text-xs text-muted-foreground">{siteConfig.areaServed.join(' · ')}</p>
              </div>
            </div>

            {/* Carte Google Maps + itinéraire + formulaire */}
            <div className="space-y-5">
              <div className="overflow-hidden rounded-3xl border border-border bg-card">
                <iframe
                  src={mapsEmbedUrl}
                  title={t('mapTitle')}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-64 w-full border-0"
                />
                <div className="flex items-center justify-between gap-3 p-5">
                  <p className="text-sm font-medium text-foreground">{t('mapTitle')}</p>
                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                  >
                    <Navigation className="size-4" aria-hidden /> {t('directions')}
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-7">
                <h2 className="font-editorial text-xl font-medium text-foreground">{t('formTitle')}</h2>
                <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('formName')}</Label>
                      <Input id="name" name="name" required autoComplete="name" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('formEmail')}</Label>
                      <Input id="email" name="email" type="email" required autoComplete="email" className="h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('formMessage')}</Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full rounded-xl border border-input bg-background/70 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none"
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={status === 'sending'} className="w-full group">
                    {status === 'sending' ? (
                      <>
                        {t('formSending')}
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      </>
                    ) : (
                      <>
                        {t('formSend')}
                        <Send className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </>
                    )}
                  </Button>
                  {status === 'success' && (
                    <p className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-500/20">
                      <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                      {t('formSuccess')}
                    </p>
                  )}
                  {status === 'error' && (
                    <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-500/20">
                      {t('formError')} {siteConfig.email}.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Maillage interne — Accueil, Tarifs, Réservation (audit) */}
          <div className="mt-10 flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('keepExploring')}
            </span>
            {internal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
              >
                {link.label} <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
