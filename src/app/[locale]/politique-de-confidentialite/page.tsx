import type { Metadata } from 'next'
import Link from 'next/link'

import { breadcrumbJsonLd, webPageJsonLd } from '@/components/seo/json-ld'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { siteConfig } from '@/lib/seo'

const description =
  'Politique de confidentialité de Shi Shi Samui : comment nous collectons, utilisons et protégeons vos données, conformément au PDPA thaïlandais et au RGPD.'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description,
  alternates: { canonical: '/politique-de-confidentialite' },
  robots: { index: false, follow: false },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webPageJsonLd(
      'Politique de confidentialité',
      description,
      '/politique-de-confidentialite'
    ),
    breadcrumbJsonLd([
      { name: 'Accueil', path: '/' },
      {
        name: 'Politique de confidentialité',
        path: '/politique-de-confidentialite',
      },
    ]),
  ],
}

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb items={[{ label: 'Politique de confidentialité' }]} />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Politique de confidentialité
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Dernière mise à jour : 15 juin 2026
          </p>

          <article className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground">

            <section className="space-y-3">
              <p>
                {siteConfig.name} (« nous », « notre ») accorde une grande importance à la
                protection de vos données personnelles. La présente politique décrit les données
                que nous collectons, pourquoi et comment nous les utilisons. {siteConfig.name}
                {' '}étant une entreprise établie en Thaïlande, ce traitement est régi par le{' '}
                <strong>Personal Data Protection Act B.E. 2562 (2019)</strong> (« PDPA »). Pour les
                visiteurs résidant dans l&apos;Union européenne, il respecte également le{' '}
                <strong>Règlement Général sur la Protection des Données</strong> (RGPD, Règlement UE
                2016/679).
              </p>
            </section>

            <section className="space-y-3">
              <h2>1. Responsable du traitement</h2>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li><strong>Nom commercial :</strong> {siteConfig.name}</li>
                <li><strong>Responsable :</strong> Paul Poulain</li>
                <li>
                  <strong>Adresse :</strong> {siteConfig.address.street}, {siteConfig.address.city},{' '}
                  {siteConfig.address.region} {siteConfig.address.postalCode}, Thaïlande
                </li>
                <li><strong>Email :</strong> {siteConfig.email}</li>
                <li><strong>Téléphone :</strong> {siteConfig.phone}</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2>2. Données personnelles collectées</h2>
              <p>
                Nous collectons uniquement les données strictement nécessaires aux finalités
                ci-dessous, dans le respect du principe de minimisation.
              </p>
              <h3 className="pt-2">a) Demande de réservation</h3>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Activité, date et heure souhaitées</li>
                <li>Coordonnées des participants supplémentaires lorsqu&apos;une réservation est faite pour plusieurs personnes</li>
                <li>Remarques éventuelles que vous renseignez</li>
              </ul>
              <h3 className="pt-2">b) Formulaire de contact</h3>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone (optionnel)</li>
                <li>Objet et contenu du message</li>
              </ul>
              <h3 className="pt-2">c) Newsletter</h3>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li>Adresse email</li>
                <li>Prénom (optionnel)</li>
              </ul>
              <h3 className="pt-2">d) Espace d&apos;administration (réservé à l&apos;équipe)</h3>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li>Adresse email du compte administrateur</li>
                <li>Jeton de session (aucun mot de passe n&apos;est stocké en clair)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2>3. Finalités et base légale</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="py-2 pr-4 text-left font-semibold text-foreground">Finalité</th>
                      <th className="py-2 pr-4 text-left font-semibold text-foreground">Base légale (PDPA / RGPD)</th>
                      <th className="py-2 text-left font-semibold text-foreground">Conservation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    <tr>
                      <td className="py-2.5 pr-4">Traiter et confirmer vos réservations</td>
                      <td className="py-2.5 pr-4">Exécution de mesures précontractuelles / contractuelles (art. 24 PDPA · art. 6.1.b RGPD)</td>
                      <td className="py-2.5">3 ans après le dernier contact</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4">Répondre à vos demandes de contact</td>
                      <td className="py-2.5 pr-4">Consentement (art. 19 PDPA · art. 6.1.a RGPD)</td>
                      <td className="py-2.5">3 ans après le dernier contact</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4">Envoyer la newsletter</td>
                      <td className="py-2.5 pr-4">Consentement, retirable à tout moment (art. 19 PDPA · art. 6.1.a RGPD)</td>
                      <td className="py-2.5">Jusqu&apos;au désabonnement</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4">Gérer l&apos;espace d&apos;administration</td>
                      <td className="py-2.5 pr-4">Intérêt légitime (art. 24 PDPA · art. 6.1.f RGPD)</td>
                      <td className="py-2.5">Durée du compte</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4">Assurer la sécurité et la disponibilité du site</td>
                      <td className="py-2.5 pr-4">Intérêt légitime (art. 24 PDPA · art. 6.1.f RGPD)</td>
                      <td className="py-2.5">12 mois</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h2>4. Sous-traitants et localisation des données</h2>
              <p>
                Vos données sont <strong>hébergées en Europe</strong>. Chaque prestataire est lié
                par un engagement de confidentialité conforme au PDPA et au RGPD.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="py-2 pr-4 text-left font-semibold text-foreground">Service</th>
                      <th className="py-2 pr-4 text-left font-semibold text-foreground">Fournisseur</th>
                      <th className="py-2 pr-4 text-left font-semibold text-foreground">Usage</th>
                      <th className="py-2 text-left font-semibold text-foreground">Localisation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    <tr>
                      <td className="py-2.5 pr-4">Hébergement</td>
                      <td className="py-2.5 pr-4">Infomaniak Network SA</td>
                      <td className="py-2.5 pr-4">Hébergement du site et des données</td>
                      <td className="py-2.5">Suisse / Europe</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4">Base de données</td>
                      <td className="py-2.5 pr-4">MongoDB Atlas (MongoDB Inc.)</td>
                      <td className="py-2.5 pr-4">Réservations, contacts, contenu</td>
                      <td className="py-2.5">Région européenne</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4">Emails transactionnels</td>
                      <td className="py-2.5 pr-4">Resend</td>
                      <td className="py-2.5 pr-4">Confirmations, rappels, newsletter</td>
                      <td className="py-2.5">Encadré par clauses contractuelles types</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                <strong>Note :</strong> aucune donnée personnelle n&apos;est vendue, louée ou
                transmise à des régies publicitaires, réseaux sociaux ou services de profilage.
              </p>
            </section>

            <section className="space-y-3">
              <h2>5. Destinataires des données</h2>
              <p>Vos données ne sont ni vendues, ni louées, ni cédées à des tiers à des fins commerciales.</p>
              <p>Elles peuvent être transmises uniquement :</p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li>À l&apos;équipe de {siteConfig.name} chargée des réservations et du contact</li>
                <li>Aux sous-traitants techniques listés ci-dessus, dans le cadre strict de leurs missions</li>
                <li>Aux autorités compétentes lorsque la loi l&apos;exige</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2>6. Transferts internationaux</h2>
              <p>
                {siteConfig.name} est établie en Thaïlande, tandis que vos données sont stockées en
                Europe (Infomaniak, MongoDB Atlas région européenne). Les éventuels transferts entre
                la Thaïlande et l&apos;Europe sont encadrés par les garanties prévues par le PDPA
                (chapitre 5) et le RGPD (chapitre V), notamment des clauses contractuelles types et
                des mesures de chiffrement en transit et au repos.
              </p>
            </section>

            <section className="space-y-3">
              <h2>7. Cookies et stockage local</h2>
              <p>
                Ce site n&apos;utilise <strong>aucun cookie publicitaire ni traceur</strong>. Il
                recourt uniquement à un stockage local technique (mémorisation de votre choix de
                consentement, de votre thème d&apos;affichage et, pour l&apos;équipe, de la session
                d&apos;administration). Pour le détail, consultez notre{' '}
                <Link href="/politique-cookies" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  Politique de cookies
                </Link>.
              </p>
            </section>

            <section className="space-y-3">
              <h2>8. Sécurité des données</h2>
              <p>Nous mettons en œuvre des mesures techniques et organisationnelles adaptées :</p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li><strong>Chiffrement en transit :</strong> toutes les communications sont protégées par HTTPS (TLS)</li>
                <li><strong>Chiffrement au repos :</strong> les données stockées sont chiffrées par l&apos;hébergeur et la base de données</li>
                <li><strong>Hachage des mots de passe :</strong> aucun mot de passe n&apos;est stocké en clair</li>
                <li><strong>Accès restreint :</strong> seuls les membres autorisés accèdent au back-office, via une authentification sécurisée</li>
                <li><strong>Mises à jour régulières</strong> des dépendances pour corriger les vulnérabilités connues</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2>9. Vos droits</h2>
              <p>
                Conformément au PDPA (sections 30 à 36) et, pour les résidents de l&apos;UE, au RGPD
                (articles 15 à 22), vous disposez des droits suivants :
              </p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données</li>
                <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
                <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données</li>
                <li><strong>Droit à la limitation</strong> : restreindre temporairement le traitement</li>
                <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format lisible par machine</li>
                <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement pour des motifs légitimes</li>
                <li><strong>Droit de retirer votre consentement</strong> à tout moment, sans effet rétroactif</li>
              </ul>
              <p>
                Pour exercer vos droits, écrivez-nous à{' '}
                <a href={`mailto:${siteConfig.email}`} className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  {siteConfig.email}
                </a>. Nous répondons dans un délai raisonnable et au plus tard sous 30 jours.
              </p>
              <p>
                En cas de différend, vous pouvez saisir l&apos;autorité compétente : en Thaïlande, le{' '}
                <strong>Personal Data Protection Committee (PDPC)</strong> ; dans l&apos;Union
                européenne, l&apos;autorité de contrôle de votre pays de résidence (en France, la{' '}
                <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  CNIL
                </a>).
              </p>
            </section>

            <section className="space-y-3">
              <h2>10. Données des mineurs</h2>
              <p>
                Le club propose des activités pour enfants (kids club). Les réservations et les
                données concernant un mineur sont fournies et gérées par un parent ou représentant
                légal. Nous ne collectons pas sciemment de données auprès d&apos;un mineur sans le
                consentement de son représentant légal. Tout parent peut nous contacter pour
                accéder à ces données, les corriger ou les supprimer.
              </p>
            </section>

            <section className="space-y-3">
              <h2>11. Modification de la politique</h2>
              <p>
                Nous pouvons modifier la présente politique à tout moment. La version en vigueur
                est celle accessible sur cette page, identifiée par sa date de dernière mise à jour.
                Toute modification substantielle sera signalée sur le site.
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
