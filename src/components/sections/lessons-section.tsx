import { ArrowUpRight, GraduationCap } from 'lucide-react'
import { useLocale } from 'next-intl'
import Image from 'next/image'

import { ActivityIcon } from '@/components/activity-icon'
import { SectionEyebrow } from '@/components/section-eyebrow'
import { Link } from '@/i18n/navigation'
import { lessons, type Locale } from '@/lib/activities'

/**
 * « Cours avec nos profs » : les activités encadrées par un professeur (coach
 * de tennis, aquagym). Posé sous les six pôles, sur l'accueil et la page
 * Activités, pour qu'un visiteur qui découvre le club voie tout de suite qu'on
 * peut aussi apprendre, pas seulement louer un court ou accéder à la piscine.
 */
export function LessonsSection() {
  const l = useLocale() as Locale
  const fr = l === 'fr'

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="max-w-2xl">
        <SectionEyebrow icon={GraduationCap}>{fr ? 'Cours avec nos profs' : 'Lessons with our coaches'}</SectionEyebrow>
        <h2 className="mt-5 font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.5rem]">
          {fr ? 'Progresser, pas seulement jouer' : 'Learn, not just play'}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {fr
            ? 'Au club, des professeurs vous accompagnent sur le court et dans la piscine, quel que soit votre niveau.'
            : 'At the club, our coaches take you further on the court and in the pool, whatever your level.'}
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {lessons.map((lesson) => (
          <Link
            key={lesson.slug}
            href={lesson.path}
            className="group relative flex aspect-[16/11] flex-col justify-end overflow-hidden rounded-3xl ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-26px_oklch(0.16_0.02_55/0.45)]"
          >
            <Image
              src={lesson.image}
              alt={lesson.name[l]}
              fill
              sizes="(min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0_0/0.92)] via-[oklch(0.14_0_0/0.3)] to-transparent"
              aria-hidden
            />
            <div className="relative flex items-end justify-between gap-4 p-6">
              <div>
                <span className="inline-flex items-center gap-2 text-white">
                  <ActivityIcon name={lesson.icon} className="size-5 text-accent" />
                  <span className="font-editorial text-2xl font-medium">{lesson.name[l]}</span>
                </span>
                <p className="mt-1.5 text-sm text-white/80">{lesson.tagline[l]}</p>
                <p className="mt-3 text-sm font-semibold text-accent">
                  {lesson.price[l]}
                  <span className="font-normal text-white/60">
                    {' · '}
                    {lesson.bookableOnline
                      ? fr ? 'réservation en ligne' : 'book online'
                      : fr ? 'réservation sur WhatsApp' : 'book on WhatsApp'}
                  </span>
                </p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition-colors group-hover:bg-accent">
                <ArrowUpRight className="size-5" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
