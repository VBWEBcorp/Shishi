import Link from 'next/link'

/**
 * Page 404 hors langue.
 *
 * La belle 404 du site vit dans `[locale]` : elle ne s'affiche que pour une
 * adresse qui commence par /en ou /fr. Une adresse sans langue valable
 * (/quelque-chose) n'atteint jamais ce segment et tombait sur l'écran par
 * défaut de Next, en anglais et sans habillage.
 *
 * Celle-ci prend le relais. Elle est volontairement sobre et sans animation :
 * elle est rendue hors du fournisseur next-intl, donc sans traduction
 * disponible. Les deux langues sont proposées, l'anglais étant la langue par
 * défaut du site.
 */

const STARS = [
  { top: '14%', left: '18%', size: 2 },
  { top: '24%', left: '74%', size: 3 },
  { top: '36%', left: '36%', size: 2 },
  { top: '18%', left: '58%', size: 2 },
  { top: '48%', left: '84%', size: 2 },
  { top: '58%', left: '12%', size: 3 },
  { top: '30%', left: '90%', size: 2 },
  { top: '66%', left: '66%', size: 2 },
]

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[oklch(0.17_0.01_60)] px-5 py-24 text-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_-10%,oklch(0.63_0.187_47/0.18),transparent_55%),linear-gradient(to_bottom,oklch(0.17_0.01_60),oklch(0.13_0.005_60))]"
      />

      {STARS.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute rounded-full bg-white/70"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
        />
      ))}

      <svg
        aria-hidden
        className="absolute bottom-0 left-2 h-28 w-28 text-black/40 sm:h-36 sm:w-36"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M48 100c-1-22-3-40-6-52 8-3 16-2 22 3-7-3-15-2-20 2 6-9 16-13 26-11-9-1-19 3-24 10 4-11 14-18 25-18-11-2-23 4-28 15 0-10 6-19 16-24-12 2-21 12-22 24-2-4-6-7-11-7 4 2 7 6 7 11-3 12-2 30-2 52z" />
      </svg>
      <svg
        aria-hidden
        className="absolute bottom-0 right-3 h-24 w-24 -scale-x-100 text-black/35 sm:h-32 sm:w-32"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M48 100c-1-22-3-40-6-52 8-3 16-2 22 3-7-3-15-2-20 2 6-9 16-13 26-11-9-1-19 3-24 10 4-11 14-18 25-18-11-2-23 4-28 15 0-10 6-19 16-24-12 2-21 12-22 24-2-4-6-7-11-7 4 2 7 6 7 11-3 12-2 30-2 52z" />
      </svg>

      <div className="relative mx-auto max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
          Error 404
        </p>

        <h1 className="mt-6 font-[family-name:var(--font-cal-sans)] text-5xl leading-[1.05] text-white sm:text-6xl">
          This page flew away
        </h1>

        <p className="mx-auto mt-6 max-w-sm text-pretty text-[17px] leading-relaxed text-white/70">
          The page you are looking for does not exist. Pick a language and
          we&apos;ll take you back to the club.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/en"
            className="inline-flex h-12 w-44 items-center justify-center rounded-full bg-[oklch(0.72_0.17_55)] text-[0.95rem] font-semibold text-black transition-transform hover:-translate-y-0.5"
          >
            English
          </Link>
          <Link
            href="/fr"
            className="inline-flex h-12 w-44 items-center justify-center rounded-full border border-white/35 text-[0.95rem] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Français
          </Link>
        </div>
      </div>
    </section>
  )
}
