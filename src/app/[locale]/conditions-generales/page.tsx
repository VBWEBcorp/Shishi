import type { Metadata } from 'next'
import Link from 'next/link'

import { breadcrumbJsonLd, webPageJsonLd } from '@/components/seo/json-ld'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { siteConfig } from '@/lib/seo'

const description =
  "Conditions générales d'utilisation du site Shi Shi Samui : accès au site, réservations et règles d'utilisation."

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description,
  alternates: { canonical: '/conditions-generales' },
  robots: { index: false, follow: false },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webPageJsonLd("Conditions générales d'utilisation", description, '/conditions-generales'),
    breadcrumbJsonLd([
      { name: 'Accueil', path: '/' },
      { name: "Conditions générales d'utilisation", path: '/conditions-generales' },
    ]),
  ],
}

export default function CGUPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb items={[{ label: "Conditions générales d'utilisation" }]} />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Conditions générales d&apos;utilisation
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Dernière mise à jour : 15 juin 2026
          </p>

          <article className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground">

            <section className="space-y-3">
              <h2>1. Objet</h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (« CGU ») définissent les
                règles d&apos;accès et d&apos;utilisation du site <strong>{siteConfig.url}</strong>,
                édité par {siteConfig.name}, club sportif et social situé à Lamai, Koh Samui
                (Thaïlande).
              </p>
              <p>
                L&apos;accès au site implique l&apos;acceptation pleine et entière des présentes CGU.
                Si vous ne les acceptez pas, vous êtes invité à ne pas utiliser le site.
              </p>
            </section>

            <section className="space-y-3">
              <h2>2. Accès au site</h2>
              <p>
                Le site est accessible gratuitement à tout utilisateur disposant d&apos;un accès à
                Internet. Tous les coûts liés à l&apos;accès (matériel, connexion) sont à la charge
                de l&apos;utilisateur.
              </p>
              <p>
                {siteConfig.name} s&apos;efforce de maintenir le site accessible en permanence, mais
                l&apos;accès peut être interrompu sans préavis pour maintenance, mise à jour ou pour
                toute autre raison technique, sans qu&apos;aucune indemnisation ne puisse être
                réclamée.
              </p>
            </section>

            <section className="space-y-3">
              <h2>3. Réservations</h2>
              <h3 className="pt-2">a) Nature de la demande</h3>
              <p>
                Le formulaire de réservation permet d&apos;envoyer une <strong>demande</strong> pour
                une activité du club (tennis, pickleball, fitness, kids club, piscine, etc.). Cette
                demande ne constitue pas une réservation ferme tant qu&apos;elle n&apos;a pas été
                confirmée par {siteConfig.name}, par email ou par message.
              </p>
              <h3 className="pt-2">b) Informations exactes</h3>
              <p>
                L&apos;utilisateur s&apos;engage à fournir des informations exactes (nom, email,
                téléphone, date, nombre de participants). Lorsqu&apos;une réservation est faite pour
                plusieurs personnes, il garantit avoir recueilli leur accord pour transmettre leurs
                coordonnées.
              </p>
              <h3 className="pt-2">c) Tarifs et paiement</h3>
              <p>
                Les tarifs sont indiqués en bahts thaïlandais (฿) et fournis à titre indicatif ;
                ils peuvent évoluer. Sauf mention contraire, le règlement s&apos;effectue sur place,
                au club. Aucun paiement n&apos;est encaissé en ligne via le site.
              </p>
              <h3 className="pt-2">d) Annulation et modification</h3>
              <p>
                Pour annuler ou modifier une demande, contactez le club dès que possible à{' '}
                <a href={`mailto:${siteConfig.email}`} className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  {siteConfig.email}
                </a>{' '}
                ou via WhatsApp. {siteConfig.name} se réserve le droit de refuser ou de reprogrammer
                une réservation en cas d&apos;indisponibilité, de conditions météorologiques ou de
                force majeure.
              </p>
            </section>

            <section className="space-y-3">
              <h2>4. Espace d&apos;administration</h2>
              <p>
                Certaines fonctionnalités sont accessibles via un espace d&apos;administration
                protégé, réservé à l&apos;équipe de {siteConfig.name}. L&apos;utilisateur habilité
                s&apos;engage à préserver la confidentialité de ses identifiants, à ne pas les
                partager et à signaler immédiatement toute utilisation suspecte. {siteConfig.name}
                {' '}peut suspendre tout accès en cas de manquement.
              </p>
            </section>

            <section className="space-y-3">
              <h2>5. Contenu du site</h2>
              <p>
                Les informations publiées (descriptions, horaires, tarifs, photos) sont fournies à
                titre indicatif. Malgré le soin apporté à leur rédaction, elles ne sauraient engager
                la responsabilité de {siteConfig.name} en cas d&apos;inexactitude ou d&apos;omission.
                Les données transmises via les formulaires sont traitées conformément à notre{' '}
                <Link href="/politique-de-confidentialite" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  Politique de confidentialité
                </Link>.
              </p>
            </section>

            <section className="space-y-3">
              <h2>6. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble du site (structure, design, code, textes, images, logos) constitue
                une œuvre protégée par la législation thaïlandaise et internationale sur la
                propriété intellectuelle. Toute reproduction, même partielle, est interdite sans
                autorisation écrite préalable. Voir nos{' '}
                <Link href="/mentions-legales" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  Mentions légales
                </Link>.
              </p>
            </section>

            <section className="space-y-3">
              <h2>7. Comportement de l&apos;utilisateur</h2>
              <p>L&apos;utilisateur s&apos;engage à ne pas :</p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li>Tenter d&apos;accéder à des zones non autorisées du site ou de ses systèmes</li>
                <li>Perturber le fonctionnement du site (attaque, injection, scraping abusif)</li>
                <li>Effectuer de fausses réservations ou des réservations de mauvaise foi</li>
                <li>Collecter les données d&apos;autres utilisateurs sans leur consentement</li>
                <li>Utiliser le site à des fins contraires à la loi</li>
              </ul>
              <p>Tout manquement pourra donner lieu à un blocage de l&apos;accès et, le cas échéant, à des poursuites.</p>
            </section>

            <section className="space-y-3">
              <h2>8. Limitation de responsabilité</h2>
              <p>
                {siteConfig.name} ne pourra être tenu responsable de tout dommage direct ou indirect
                résultant de l&apos;utilisation du site, notamment perte de données, interruption
                d&apos;activité ou dommage au matériel. L&apos;utilisateur est seul responsable de
                l&apos;usage qu&apos;il fait des informations disponibles sur le site.
              </p>
            </section>

            <section className="space-y-3">
              <h2>9. Liens externes</h2>
              <p>
                Le site peut contenir des liens vers des sites tiers (réseaux sociaux, cartes,
                WhatsApp). {siteConfig.name} n&apos;exerce aucun contrôle sur ces sites et décline
                toute responsabilité quant à leur contenu ou leurs pratiques.
              </p>
            </section>

            <section className="space-y-3">
              <h2>10. Modification des CGU</h2>
              <p>
                {siteConfig.name} se réserve le droit de modifier les présentes CGU à tout moment.
                Les modifications prennent effet dès leur publication sur cette page. L&apos;usage
                continu du site après modification vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <section className="space-y-3">
              <h2>11. Droit applicable et litiges</h2>
              <p>
                Les présentes CGU sont régies par le droit thaïlandais. En cas de litige relatif à
                leur interprétation ou exécution, les parties s&apos;engagent à rechercher une
                solution amiable. À défaut, le litige sera porté devant les tribunaux compétents de
                la province de Surat Thani (Koh Samui), en Thaïlande.
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
                {' '}et notre{' '}
                <Link
                  href="/politique-cookies"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Politique de cookies
                </Link>.
              </p>
            </section>
          </article>
        </div>
      </section>
    </>
  )
}
