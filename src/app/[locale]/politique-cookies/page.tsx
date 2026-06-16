import type { Metadata } from 'next'
import Link from 'next/link'

import { breadcrumbJsonLd, webPageJsonLd } from '@/components/seo/json-ld'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { siteConfig } from '@/lib/seo'

const description =
  'Politique de cookies de Shi Shi Samui : stockage local technique utilisé, finalités et gestion de vos préférences.'

export const metadata: Metadata = {
  title: 'Politique de cookies',
  description,
  alternates: { canonical: '/politique-cookies' },
  robots: { index: false, follow: false },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webPageJsonLd('Politique de cookies', description, '/politique-cookies'),
    breadcrumbJsonLd([
      { name: 'Accueil', path: '/' },
      { name: 'Politique de cookies', path: '/politique-cookies' },
    ]),
  ],
}

export default function CookiePolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb items={[{ label: 'Politique de cookies' }]} />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Politique de cookies
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Dernière mise à jour : 15 juin 2026
          </p>

          <article className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground">

            <section className="space-y-3">
              <h2>1. En bref</h2>
              <p>
                Shi Shi Samui respecte votre vie privée. Ce site <strong>n&apos;utilise aucun
                cookie publicitaire, de profilage, de retargeting ou de pistage</strong>, et ne
                partage aucune donnée avec des régies publicitaires ou des réseaux sociaux.
              </p>
              <p>
                Pour fonctionner, le site recourt uniquement à un <strong>stockage local technique
                </strong> (« localStorage ») de votre navigateur, décrit ci-dessous. Aucun
                identifiant de suivi n&apos;y est conservé.
              </p>
            </section>

            <section className="space-y-3">
              <h2>2. Cadre légal</h2>
              <p>L&apos;utilisation de traceurs est encadrée par :</p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li>Le <strong>Personal Data Protection Act B.E. 2562 (2019)</strong> (PDPA), Shi Shi Samui étant établie en Thaïlande</li>
                <li>Pour les visiteurs de l&apos;Union européenne, la directive ePrivacy 2002/58/CE et le RGPD</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2>3. Stockage local utilisé</h2>
              <p>
                Ces éléments sont strictement nécessaires au fonctionnement du site ou à un confort
                d&apos;usage que vous contrôlez. Ils restent sur votre appareil et ne sont jamais
                transmis à des tiers.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="py-2 pr-4 text-left font-semibold text-foreground">Clé</th>
                      <th className="py-2 pr-4 text-left font-semibold text-foreground">Finalité</th>
                      <th className="py-2 text-left font-semibold text-foreground">Donnée stockée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-xs">cookie-consent</td>
                      <td className="py-2.5 pr-4">Mémorise votre choix d&apos;acceptation ou de refus</td>
                      <td className="py-2.5">« accepted » ou « refused »</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-xs">theme</td>
                      <td className="py-2.5 pr-4">Mémorise votre préférence d&apos;affichage (clair / sombre)</td>
                      <td className="py-2.5">« light » ou « dark »</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-xs">authToken / authUser</td>
                      <td className="py-2.5 pr-4">Session de l&apos;espace d&apos;administration (équipe uniquement)</td>
                      <td className="py-2.5">Jeton de session, email et rôle (aucun mot de passe)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs">
                Le stockage local n&apos;a pas de date d&apos;expiration automatique : il persiste
                jusqu&apos;à ce que vous le supprimiez (voir section 5) ou modifiiez votre choix.
              </p>
            </section>

            <section className="space-y-3">
              <h2>4. Cookies tiers éventuels</h2>
              <p>
                Certains contenus intégrés (carte Google Maps, lien WhatsApp, QR code) peuvent
                provoquer des requêtes vers des services tiers disposant de leur propre politique de
                confidentialité. Lorsque c&apos;est possible, le mode respectueux de la vie privée
                (« privacy-enhanced » / « no-cookie ») est privilégié. Aucun cookie publicitaire
                n&apos;est déposé par {siteConfig.name}.
              </p>
            </section>

            <section className="space-y-3">
              <h2>5. Gérer vos préférences</h2>
              <h3 className="pt-2">a) Via le bandeau de consentement</h3>
              <p>
                Lors de votre première visite, un bandeau vous permet d&apos;accepter ou de refuser.
                Votre choix est conservé localement et peut être réinitialisé en vidant le stockage
                de votre navigateur.
              </p>
              <h3 className="pt-2">b) Via votre navigateur</h3>
              <p>Vous pouvez à tout moment effacer le stockage local et bloquer les traceurs :</p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li><strong>Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Cookies et données des sites</li>
                <li><strong>Firefox :</strong> Paramètres &gt; Vie privée et sécurité &gt; Cookies et données de sites</li>
                <li><strong>Safari :</strong> Réglages &gt; Confidentialité &gt; Gérer les données de sites web</li>
                <li><strong>Edge :</strong> Paramètres &gt; Cookies et autorisations de site</li>
              </ul>
              <p>
                <strong>Attention :</strong> effacer le stockage local peut altérer le confort
                d&apos;usage (perte de votre préférence de thème, du choix de consentement, et
                déconnexion de l&apos;espace d&apos;administration).
              </p>
            </section>

            <section className="space-y-3">
              <h2>6. Vos droits</h2>
              <p>
                Vous disposez sur vos données des mêmes droits que ceux décrits dans notre Politique
                de confidentialité (accès, rectification, effacement, opposition, portabilité,
                limitation). Pour les exercer, écrivez-nous à{' '}
                <a href={`mailto:${siteConfig.email}`} className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  {siteConfig.email}
                </a>.
              </p>
              <p>
                En cas de litige, vous pouvez saisir le <strong>Personal Data Protection Committee
                (PDPC)</strong> en Thaïlande ou, si vous résidez dans l&apos;UE, l&apos;autorité de
                contrôle de votre pays.
              </p>
            </section>

            <section className="space-y-3">
              <h2>7. Mise à jour</h2>
              <p>
                Cette politique peut être modifiée pour refléter les évolutions du site ou de la
                réglementation. En cas d&apos;ajout de traceurs optionnels, votre consentement sera
                de nouveau sollicité.
              </p>
            </section>

            <section className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-5">
              <p className="text-foreground">
                Consultez également nos{' '}
                <Link
                  href="/mentions-legales"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Mentions légales
                </Link>
                ,{' '}
                <Link
                  href="/politique-de-confidentialite"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Politique de confidentialité
                </Link>
                {' '}et nos{' '}
                <Link
                  href="/conditions-generales"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Conditions générales d&apos;utilisation
                </Link>.
              </p>
            </section>
          </article>
        </div>
      </section>
    </>
  )
}
