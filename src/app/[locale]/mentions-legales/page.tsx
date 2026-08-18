import type { Metadata } from 'next'
import Link from 'next/link'

import { breadcrumbJsonLd, webPageJsonLd } from '@/components/seo/json-ld'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { siteConfig } from '@/lib/seo'

const description =
  "Mentions légales du site Shi Shi Samui : éditeur, hébergement, propriété intellectuelle et conditions d'utilisation."

export const metadata: Metadata = {
  title: 'Mentions légales',
  description,
  alternates: { canonical: '/mentions-legales' },
  robots: { index: false, follow: false },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webPageJsonLd('Mentions légales', description, '/mentions-legales'),
    breadcrumbJsonLd([
      { name: 'Accueil', path: '/' },
      { name: 'Mentions légales', path: '/mentions-legales' },
    ]),
  ],
}

export default function LegalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb items={[{ label: 'Mentions légales' }]} />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Mentions légales
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Dernière mise à jour : 15 juin 2026
          </p>

          <article className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground">

            <section className="space-y-3">
              <h2>1. Éditeur du site</h2>
              <p>
                Le site accessible à l&apos;adresse <strong>{siteConfig.url}</strong> est édité par :
              </p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li><strong>Nom commercial :</strong> {siteConfig.name}</li>
                <li>
                  <strong>Activité :</strong> club sportif et social (tennis, pickleball, fitness,
                  kids club, piscine, restauration) à Lamai, Koh Samui
                </li>
                <li>
                  <strong>Adresse :</strong> {siteConfig.address.street}, {siteConfig.address.city},{' '}
                  {siteConfig.address.region} {siteConfig.address.postalCode}, Thaïlande
                </li>
                {/* Nom du gerant retire le 18/08/2026 en attendant les work permits ;
                    l'entite juridique reste identifiee. A remettre ensuite. */}
                <li><strong>Responsable de la publication :</strong> la direction de {siteConfig.name}</li>
                <li><strong>Email :</strong> {siteConfig.email}</li>
                <li><strong>Téléphone :</strong> {siteConfig.phone}</li>
                <li>
                  <strong>Enregistrement (Thaïlande) :</strong> entreprise immatriculée en
                  Thaïlande [numéro d&apos;enregistrement DBD à compléter par l&apos;exploitant]
                </li>
              </ul>
              <p>
                Shi Shi Samui est une entreprise établie en Thaïlande. À ce titre, son activité
                est soumise au droit thaïlandais, notamment au <em>Personal Data Protection Act
                B.E. 2562 (2019)</em> (« PDPA ») pour la protection des données personnelles.
              </p>
            </section>

            <section className="space-y-3">
              <h2>2. Hébergement</h2>
              <p>
                Le site et les données associées sont hébergés en Europe afin de garantir un
                niveau élevé de protection des données :
              </p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li><strong>Hébergeur :</strong> Infomaniak Network SA</li>
                <li><strong>Adresse :</strong> Rue Eugène-Marziano 25, 1227 Les Acacias, Genève, Suisse</li>
                <li><strong>Site web :</strong> <a href="https://www.infomaniak.com" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">www.infomaniak.com</a></li>
                <li><strong>Localisation des données :</strong> centres de données situés en Suisse et en Europe (données hébergées en Europe)</li>
              </ul>
              <h3 className="pt-2">Services techniques complémentaires</h3>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li><strong>Base de données :</strong> MongoDB Atlas (MongoDB Inc.) — région européenne</li>
                <li><strong>Emails transactionnels :</strong> Resend (envoi des confirmations de réservation, rappels et messages de contact)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2>3. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble des contenus présents sur le site (textes, photographies,
                illustrations, logos, marques, éléments graphiques, vidéos, structure et design)
                est la propriété de {siteConfig.name} ou de ses partenaires, et est protégé par les
                lois thaïlandaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication ou adaptation,
                totale ou partielle, de ces éléments, quel que soit le moyen ou le procédé
                utilisé, est interdite sauf autorisation écrite préalable de {siteConfig.name}.
              </p>
              <h3 className="pt-2">Licences open source</h3>
              <p>
                Ce site s&apos;appuie sur des bibliothèques et frameworks open source (licences MIT,
                Apache 2.0, ISC). Les droits d&apos;auteur de ces composants appartiennent à leurs
                auteurs respectifs et leur utilisation n&apos;emporte aucune cession de droits.
              </p>
            </section>

            <section className="space-y-3">
              <h2>4. Réservations</h2>
              <p>
                Le site permet d&apos;envoyer des demandes de réservation pour les activités du
                club. Une demande de réservation constitue une demande de disponibilité et non un
                contrat ferme : elle est confirmée par email par {siteConfig.name}. Sauf mention
                contraire, le règlement s&apos;effectue sur place, au club. Les conditions détaillées
                figurent dans nos{' '}
                <Link href="/conditions-generales" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  Conditions générales d&apos;utilisation
                </Link>.
              </p>
            </section>

            <section className="space-y-3">
              <h2>5. Limitation de responsabilité</h2>
              <p>
                {siteConfig.name} s&apos;efforce de fournir des informations aussi précises et
                actualisées que possible. Toutefois, l&apos;éditeur ne saurait être tenu responsable
                des omissions, inexactitudes ou carences dans la mise à jour, qu&apos;elles soient de
                son fait ou de celui de tiers partenaires.
              </p>
              <p>{siteConfig.name} décline toute responsabilité en cas de :</p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li>Interruption temporaire du site pour maintenance ou mise à jour</li>
                <li>Dommages résultant d&apos;une intrusion frauduleuse d&apos;un tiers</li>
                <li>Impossibilité d&apos;accès au site en raison d&apos;un dysfonctionnement du réseau Internet</li>
                <li>Dommages causés au matériel de l&apos;utilisateur lors de l&apos;accès au site</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2>6. Liens hypertextes</h2>
              <p>
                Le site peut contenir des liens vers des sites tiers (réseaux sociaux, cartes,
                WhatsApp). {siteConfig.name} ne dispose d&apos;aucun moyen de contrôle sur le contenu
                de ces sites et décline toute responsabilité quant à leur contenu, leurs produits,
                services ou pratiques en matière de données.
              </p>
            </section>

            <section className="space-y-3">
              <h2>7. Données personnelles</h2>
              <p>
                Le traitement des données personnelles est décrit dans notre{' '}
                <Link href="/politique-de-confidentialite" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  Politique de confidentialité
                </Link>
                , conforme au PDPA thaïlandais et, pour les visiteurs résidant dans l&apos;Union
                européenne, au Règlement Général sur la Protection des Données (RGPD). Pour toute
                question, contactez-nous à{' '}
                <a href={`mailto:${siteConfig.email}`} className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  {siteConfig.email}
                </a>.
              </p>
            </section>

            <section className="space-y-3">
              <h2>8. Droit applicable et juridiction compétente</h2>
              <p>
                Les présentes mentions légales sont régies par le droit thaïlandais. En cas de
                litige, et après l&apos;échec de toute tentative de résolution amiable, les tribunaux
                compétents de la province de Surat Thani (Koh Samui), en Thaïlande, seront seuls
                compétents.
              </p>
              <p>
                Les consommateurs résidant dans l&apos;Union européenne peuvent également recourir à
                la plateforme de règlement en ligne des litiges de la Commission européenne :{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  ec.europa.eu/consumers/odr
                </a>.
              </p>
            </section>

            <section className="space-y-3">
              <h2>9. Crédits</h2>
              <ul className="list-inside list-disc space-y-1 pl-1">
                {/* Crédit du concepteur retiré le 18/08/2026 (cf. footer.tsx). */}
                <li><strong>Icônes :</strong> Lucide Icons (licence ISC)</li>
                <li><strong>Crédits photos :</strong> Shi Shi Samui</li>
              </ul>
            </section>

            <section className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-5">
              <p className="text-foreground">
                Pour connaître nos pratiques en matière de données personnelles, consultez notre{' '}
                <Link
                  href="/politique-de-confidentialite"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Politique de confidentialité
                </Link>
                ,{' '}
                <Link
                  href="/conditions-generales"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Conditions générales d&apos;utilisation
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
