'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { ActivityIcon } from '@/components/activity-icon'
import { BackgroundVideo } from '@/components/background-video'
import { ActivitySelect } from '@/components/activity-select'

import { DatePopover } from '@/components/date-popover'
import { WeatherWidget } from '@/components/weather-widget'
import { ResponsivePhoto } from '@/components/responsive-photo'
import { useContent } from '@/hooks/use-content'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { photoAlt } from '@/lib/photo-alt'
import { hasImage, type ResponsiveImageValue } from '@/lib/responsive-image'

/**
 * Modale de réservation, chargée SEULEMENT quand le visiteur clique sur « Rechercher ».
 *
 * Elle tire tout le formulaire de /book-now (52 Ko de source à elle seule, plus la liste
 * des indicatifs téléphoniques, le sélecteur de date et le sélecteur d'activité). Tout
 * cela partait dans le JavaScript initial de l'accueil alors que la modale reste fermée
 * tant qu'on ne clique pas. Le rapport SEO d'août 2026 (§7) demande précisément d'alléger
 * les scripts chargés au démarrage : c'est le plus gros morceau de la page.
 *
 * `ssr: false` : une modale fermée n'a rien à rendre côté serveur.
 */
const BookingDialog = dynamic(
  () => import('@/components/booking-dialog').then((m) => m.BookingDialog),
  { ssr: false }
)

/** Vidéo drone livrée avec le site, tant que le club n'en fournit pas d'autre. */
const DEFAULT_HERO_VIDEO = '/videos/hero-pool.mp4'

/**
 * Photo de fond par défaut du hero.
 *
 * Le hero n'affichait une photo QUE si une image avait été déposée dans l'espace admin.
 * Sans elle, le premier écran de l'accueil était un aplat noir jusqu'à ce que la vidéo
 * démarre. Sur mobile, où la vidéo ne part plus (cf. <BackgroundVideo />), il le serait
 * resté. Cette photo est aussi le poster de la vidéo : même image, aucune rupture.
 */
const DEFAULT_HERO_IMAGE = '/photos/pool-panorama-portrait.webp'

/** Hero de l'accueil, piloté par l'espace admin. */
type HeroContent = {
  eyebrow?: string
  title?: string
  description?: string
  /** Vidéo de fond. Vidée dans l'admin, seule la photo reste. */
  video?: string
  /** Photo de fond : visible sous la vidéo, et seule si aucune vidéo. */
  image?: ResponsiveImageValue
}

/** Sépare un titre éditable pour mettre le dernier mot en italique éditorial (DA). */
function splitAccent(title: string): { lead: string; accent: string } {
  const words = title.trim().split(/\s+/)
  if (words.length <= 1) return { lead: '', accent: title }
  return { lead: words.slice(0, -1).join(' '), accent: words[words.length - 1] }
}

/** Petit séparateur losange repris du logo (── ◆ ──). */
function DiamondRule() {
  return (
    <div className="mt-7 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/50" />
      <span className="size-1.5 rotate-45 bg-accent" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/50" />
    </div>
  )
}

export function ShishiHero() {
  const t = useTranslations('Home.hero')
  const l = useLocale() as Locale
  const { data } = useContent('home', {} as { hero?: HeroContent })
  const hero = data.hero ?? {}
  const badge = hero.eyebrow || t('badge')
  const subtitle = hero.description || t('subtitle')
  // Vidéo de fond : celle saisie en admin, sinon la vidéo drone livrée avec le
  // site. Vidée volontairement dans l'admin, le hero garde la photo seule.
  const heroVideo = hero.video === '' ? '' : hero.video || DEFAULT_HERO_VIDEO
  const featured = activities.find((a) => a.featured) ?? activities[0]

  // Recherche fonctionnelle : activité + date → /booking pré-rempli
  const [activitySlug, setActivitySlug] = useState(featured.slug)
  const [date, setDate] = useState('')
  const [today, setToday] = useState('')
  const [videoReady, setVideoReady] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  // Défaut « aujourd'hui » posé après montage (évite l'écart SSR/CSR)
  useEffect(() => {
    const d = new Date().toISOString().slice(0, 10)
    setToday(d)
    setDate(d)
  }, [])

  // Réservation = popup direct (UX), pas de navigation. La page /book-now reste
  // l'URL réelle (SEO) pour les accès directs et le maillage interne.
  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBookingOpen(true)
  }

  return (
    <section className="relative isolate z-20 min-h-[94vh] bg-[oklch(0.16_0_0)]">
      {/* Fond du hero, remplaçable depuis l'espace admin : une vidéo si le club
          en fournit une, sinon une photo. La photo sert aussi de repli quand le
          navigateur refuse l'autoplay (mouvement réduit). */}
      <ResponsivePhoto
        value={hasImage(hero.image) ? hero.image : DEFAULT_HERO_IMAGE}
        alt={photoAlt(hasImage(hero.image) ? undefined : DEFAULT_HERO_IMAGE, l)}
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Chargée après la page, jamais avant : cf. <BackgroundVideo />. */}
      <BackgroundVideo
        key={heroVideo}
        src={heroVideo}
        poster={hasImage(hero.image) ? undefined : DEFAULT_HERO_IMAGE}
        onReady={() => setVideoReady(true)}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Voile neutre : assez de contraste pour le texte, sans teinte chaude */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[oklch(0.2_0_0/0.4)] via-[oklch(0.2_0_0/0.32)] to-[oklch(0.16_0_0/0.86)]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[94vh] max-w-4xl flex-col items-center justify-center px-4 pb-24 pt-28 text-center sm:px-6">
        {/* Eyebrow localisation + météo — petites capitales espacées (Lifetime) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/90 ring-1 ring-white/20 backdrop-blur">
            <MapPin className="size-3.5" aria-hidden />
            {badge}
          </span>
          <WeatherWidget />
        </div>

        {/* Titre éditorial — Poppins, dernier mot en italique orange (DA) */}
        <h1 className="mt-8 font-editorial text-[2.6rem] font-normal leading-[1.05] tracking-[-0.01em] text-white sm:text-6xl lg:text-[4.4rem]">
          {hero.title ? (
            (() => {
              const { lead, accent } = splitAccent(hero.title!)
              return lead ? (
                <>
                  {lead}{' '}
                  <span className="italic text-accent/95">{accent}</span>
                </>
              ) : (
                <span className="italic">{accent}</span>
              )
            })()
          ) : (
            t.rich('title', {
              accent: (chunks) => <span className="italic text-accent/95">{chunks}</span>,
            })
          )}
        </h1>

        <DiamondRule />

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
          {subtitle}
        </p>

        {/* Barre de réservation fonctionnelle — structure Anybuddy, peau bohème claire */}
        <form
          onSubmit={handleSearch}
          className="group relative z-40 mt-9 flex w-full max-w-xl items-stretch gap-1 rounded-[1.4rem] bg-card/95 p-2 text-left shadow-[0_30px_70px_-24px_oklch(0.16_0.02_55/0.8)] ring-1 ring-black/5 backdrop-blur-md"
        >
          {/* Activité — sélecteur custom partagé (même menu que le popup de réservation) */}
          <ActivitySelect
            value={activitySlug}
            onChange={setActivitySlug}
            locale={l}
            variant="bar"
            label={t('chooseActivity')}
          />

          <span className="hidden w-px self-stretch bg-border sm:block" aria-hidden />

          {/* Date — calendrier custom (DA Shi Shi) */}
          <div className="hidden sm:flex">
            <DatePopover value={date} today={today} onChange={setDate} locale={l} />
          </div>

          <button
            type="submit"
            className="flex items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-[0_12px_28px_-10px_oklch(0.63_0.187_47/0.7)] transition-all hover:-translate-y-0.5 hover:brightness-105"
          >
            <Search className="size-4" aria-hidden />
            <span className="ml-2 hidden sm:inline">{t('bookNow')}</span>
          </button>
        </form>

        {/* Pills activités — translucides, raffinées */}
        <div className="relative z-0 mt-12 flex flex-wrap items-center justify-center gap-2 sm:mt-14">
          {activities.map((a) => (
            <Link
              key={a.slug}
              href={a.path}
              className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur transition-all ${
                a.featured
                  ? 'bg-white/15 text-white ring-1 ring-accent/80'
                  : 'bg-white/[0.07] text-white/85 ring-1 ring-white/15 hover:bg-white/15 hover:ring-white/30'
              }`}
            >
              <ActivityIcon name={a.icon} className="size-4 text-accent" />
              {a.name[l]}
            </Link>
          ))}
        </div>

      </div>

      {/* Popup de réservation, pré-rempli avec l'activité et la date choisies.
          Monté au premier clic seulement : sans cette condition, le chargement
          différé n'éviterait que le rendu, pas le téléchargement du morceau. */}
      {bookingOpen && (
        <BookingDialog
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          activity={activitySlug}
          date={date}
        />
      )}
    </section>
  )
}
