import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import {
  BadgeCheck,
  BellRing,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Image as ImageIcon,
  KeyRound,
  Lock,
  Mail,
  Megaphone,
  Rocket,
  Ticket,
  Users,
  UserSquare2,
} from 'lucide-react'

import { PREVIEW_CODE, PREVIEW_COOKIE } from '@/lib/launch'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: "Guide d'utilisation | Shi Shi Samui" },
  robots: { index: false, follow: false },
}

// Rendu à CHAQUE requête : la protection par cookie (code d'aperçu) doit être
// évaluée en direct, jamais figée au build (sinon la page resterait verrouillée).
export const dynamic = 'force-dynamic'

/**
 * GUIDE D'UTILISATION — page interne (noindex) pour le client.
 *
 * Objectif : répertorier de façon TRÈS synthétique « comment on fait » chaque
 * action de la plateforme (le client reviendra souvent). À faire évoluer au fil
 * des améliorations de l'outil.
 *
 * Protection : la page est réservée aux personnes possédant le code d'aperçu
 * (même cookie que la préversion privée du site). En local (dev), toujours
 * visible. Les identifiants admin sont lus dans la config serveur (jamais
 * stockés dans le code) — ils ne s'affichent qu'aux visiteurs autorisés.
 */

const SITE = siteConfig.url.replace(/\/$/, '')

interface Section {
  icon: React.ComponentType<{ className?: string }>
  title: string
  where: string
  steps: string[]
  tip?: string
}

const SECTIONS: Section[] = [
  {
    icon: CalendarCheck,
    title: 'Voir & gérer les réservations',
    where: 'Admin → Réservations',
    steps: [
      'La cloche 🔔 en haut signale les nouvelles réservations.',
      'Filtrez par statut (en attente, confirmée…) ou cherchez un nom.',
      'Ouvrez une réservation pour la confirmer ou l’annuler.',
    ],
    tip: 'Le client reçoit un email de confirmation automatique, puis un rappel avant sa séance. Vous recevez aussi une alerte à chaque réservation.',
  },
  {
    icon: CreditCard,
    title: 'Créditer un adhérent',
    where: 'Admin → Adhérents',
    steps: [
      'Ouvrez la fiche de l’adhérent.',
      'Ajoutez des crédits sur une activité — soit ponctuels (valables 1 mois), soit en recharge automatique mensuelle.',
      'Enregistrez : les crédits apparaissent aussitôt dans son espace.',
    ],
    tip: '1 crédit = 1 h (ou 1 accès) de l’activité. Les crédits tennis servent au tennis, ceux de piscine à la piscine, etc.',
  },
  {
    icon: Ticket,
    title: 'Créer un abonnement (catalogue)',
    where: 'Admin → Abonnements',
    steps: [
      'Cliquez sur « Nouveau » : donnez un nom, un prix indicatif et un lot de crédits par activité.',
      'Cochez « Proposable » pour pouvoir l’appliquer.',
      'Depuis la fiche d’un adhérent, appliquez-le en 1 clic : la recharge mensuelle se met en place toute seule.',
    ],
    tip: 'À la date anniversaire, les crédits de l’abonnement se rechargent automatiquement chaque mois.',
  },
  {
    icon: Users,
    title: 'Consulter le fichier clients (CRM)',
    where: 'Admin → CRM',
    steps: [
      'Chaque réservation crée automatiquement une fiche client.',
      'L’étoile ⭐ Adhérent = personne avec un compte ; sans étoile = client de passage.',
      'Filtrez (adhérents, abonnés, pays…), ajoutez des tags/notes, ou exportez en CSV.',
    ],
  },
  {
    icon: Mail,
    title: 'Envoyer une newsletter',
    where: 'Admin → Newsletter',
    steps: [
      'Choisissez la cible : adhérents uniquement, un pays, une période, ou une sélection manuelle.',
      'Écrivez l’objet et le message ({prenom} se personnalise automatiquement).',
      'Ajoutez une image / un bouton si besoin, cliquez « Test » (l’email arrive chez vous), puis « Envoyer ».',
    ],
    tip: 'Les désinscrits sont toujours exclus automatiquement. Limite ~100 envois par jour.',
  },
  {
    icon: Megaphone,
    title: 'Afficher une pop-up ou une bannière',
    where: 'Admin → Marketing',
    steps: [
      'Rédigez le message (promo, événement, info…) et un lien éventuel.',
      'Activez la pop-up ou la bannière d’annonce.',
      'Désactivez-la quand vous voulez — c’est instantané.',
    ],
  },
  {
    icon: ImageIcon,
    title: 'Gérer la galerie photos / vidéos',
    where: 'Admin → Galerie',
    steps: [
      'Ajoutez vos photos et vidéos.',
      'Masquez ou réaffichez chaque média d’un clic.',
    ],
  },
  {
    icon: BookOpen,
    title: 'Publier un article de blog',
    where: 'Admin → Blog',
    steps: [
      'Cliquez sur « Nouveau », ajoutez un titre, le contenu et une image.',
      'Publiez : l’article est en ligne et aide votre référencement Google.',
    ],
  },
  {
    icon: BadgeCheck,
    title: 'Modifier les textes des pages',
    where: 'Admin → Pages',
    steps: [
      'Choisissez la page à modifier.',
      'En haut, basculez FR / EN pour éditer chaque langue.',
      'Modifiez le texte puis « Enregistrer ».',
    ],
    tip: 'Le français et l’anglais sont deux pages séparées (pour le référencement) : pensez à mettre à jour les deux.',
  },
]

export default async function GuideUtilisationPage() {
  const jar = await cookies()
  const authorized =
    process.env.NODE_ENV !== 'production' || jar.get(PREVIEW_COOKIE)?.value === PREVIEW_CODE

  if (!authorized) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
          <Lock className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 font-editorial text-2xl font-normal text-foreground">Page privée</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ce guide est réservé à l’équipe. Ouvrez d’abord le site avec votre code d’accès, puis
          revenez sur cette page.
        </p>
      </div>
    )
  }

  const adminEmail = process.env.ADMIN_EMAIL || '(défini sur Netlify — variable ADMIN_EMAIL)'
  const adminPassword = process.env.ADMIN_PASSWORD || '(défini sur Netlify — variable ADMIN_PASSWORD)'

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
      {/* En-tête */}
      <header>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
          <Lock className="size-3" aria-hidden /> Document confidentiel
        </div>
        <h1 className="mt-4 font-editorial text-4xl font-normal tracking-[-0.01em] text-foreground sm:text-5xl">
          Guide d’<span className="italic text-accent">utilisation</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Tout ce que vous pouvez faire sur la plateforme, en version courte. Gardez cette page sous
          la main : elle est mise à jour au fur et à mesure des améliorations de l’outil.
        </p>
      </header>

      {/* Accès & mots de passe */}
      <section className="mt-10 overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.07] to-card p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-editorial text-2xl font-normal text-foreground">
          <KeyRound className="size-5 text-accent" aria-hidden /> Accès & codes
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AccessCard label="Espace admin (gestion du site)" url={`${SITE}/admin`}>
            <Line k="Email" v={adminEmail} />
            <Line k="Mot de passe" v={adminPassword} mono />
          </AccessCard>
          <AccessCard label="Aperçu privé du site (avant lancement)" url={`${SITE}/?code=${PREVIEW_CODE}`}>
            <Line k="Code d’accès" v={PREVIEW_CODE} mono />
            <p className="mt-1 text-xs text-muted-foreground">
              Ce lien débloque l’intégralité du site pendant la phase « bientôt en ligne ».
            </p>
          </AccessCard>
          <AccessCard label="Espace adhérent (côté client)" url={`${SITE}/fr/member`}>
            <p className="text-xs text-muted-foreground">
              L’adresse que vos clients utilisent pour créer leur compte et voir leurs crédits.
            </p>
          </AccessCard>
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
              <BellRing className="size-4" aria-hidden /> À savoir
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Le code d’aperçu et le mot de passe admin se ressemblent — attention aux majuscules.
              Ne partagez ce guide qu’aux personnes de confiance.
            </p>
          </div>
        </div>
      </section>

      {/* Comment faire — sections */}
      <section className="mt-12">
        <h2 className="font-editorial text-2xl font-normal text-foreground">Comment faire ?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <article key={s.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-ocean ring-1 ring-ocean/20">
                  <s.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                  <p className="text-xs font-medium text-accent">{s.where}</p>
                </div>
              </div>
              <ol className="mt-4 space-y-2">
                {s.steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              {s.tip && (
                <p className="mt-4 rounded-xl bg-secondary/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  💡 {s.tip}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Espace adhérent — côté client */}
      <section className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-editorial text-2xl font-normal text-foreground">
          <UserSquare2 className="size-5 text-accent" aria-hidden /> L’espace adhérent, côté client
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          {[
            { n: 1, t: 'Il crée son compte', d: 'En ligne, en 30 secondes (nom, email, mot de passe).' },
            { n: 2, t: 'Vous chargez ses crédits', d: 'À son passage au club, au moment du règlement.' },
            { n: 3, t: 'Il réserve en ligne', d: 'Ses crédits sont déduits automatiquement.' },
            { n: 4, t: 'Il réserve à l’avance', d: 'Jusqu’à 10 jours (contre 3 pour le public).' },
          ].map((x) => (
            <div key={x.n} className="rounded-2xl border border-border bg-background/60 p-4">
              <span className="font-editorial text-3xl font-normal text-accent/90">{x.n}</span>
              <h3 className="mt-1 text-sm font-semibold text-foreground">{x.t}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mise en ligne */}
      <section className="mt-6 flex flex-wrap items-center gap-4 rounded-3xl border border-ocean/20 bg-ocean/[0.05] p-6 sm:p-8">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ocean/10 text-ocean ring-1 ring-ocean/20">
          <Rocket className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-editorial text-xl font-normal text-foreground">Mettre le site en ligne</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Le site est en « aperçu privé » : seules les personnes avec le code le voient. Pour le
            lancer officiellement (visible de tous et référencé sur Google), il suffit de nous le
            demander — la bascule prend quelques minutes.
          </p>
        </div>
      </section>

      {/* Bon à savoir */}
      <section className="mt-12">
        <h2 className="font-editorial text-2xl font-normal text-foreground">Bon à savoir</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            'Aucun paiement en ligne : tout se règle sur place, au club.',
            'Emails automatiques (confirmations, rappels, newsletter) envoyés via un service professionnel.',
            'Site entièrement bilingue français / anglais et optimisé pour Google.',
            'Fonctionne parfaitement sur mobile, tablette et ordinateur.',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        Une question ou une amélioration à demander ? Contactez VBWEB. Ce guide évolue avec l’outil.
      </p>
    </div>
  )
}

function AccessCard({
  label,
  url,
  children,
}: {
  label: string
  url: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block truncate text-xs font-medium text-accent hover:underline"
      >
        {url}
      </a>
      <div className="mt-3 space-y-1.5">{children}</div>
    </div>
  )
}

function Line({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{k} :</span>
      <span className={mono ? 'font-mono font-semibold text-foreground' : 'font-semibold text-foreground'}>
        {v}
      </span>
    </div>
  )
}
