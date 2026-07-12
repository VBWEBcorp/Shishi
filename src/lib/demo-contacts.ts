/**
 * Contacts de DÉMONSTRATION — purement côté front, jamais enregistrés en base.
 *
 * Affichés uniquement quand le CRM est encore vide (aucune vraie réservation),
 * pour permettre de se projeter sur le rendu (KPIs, carte, classement pays).
 * Dès qu'un vrai contact existe, ces exemples disparaissent automatiquement.
 *
 * Les dates sont figées (chaînes ISO) pour rester stables entre le rendu
 * serveur et client (pas de décalage d'hydratation).
 */
import { COUNTRY_BY_ISO2 } from '@/lib/country-codes'

export interface DemoContact {
  _id: string
  email: string
  name?: string
  phone?: string
  country?: string
  source: string[]
  tags: string[]
  newsletterOptIn: boolean
  unsubscribedAt?: string | null
  lastBookingAt?: string | null
  bookingsCount: number
  notes?: string
  createdAt: string
  updatedAt: string
}

/** [nom, email, iso2, n° local (vide = pas de tél.), optIn, désinscrit, résas, créé le, dernière résa, tags] */
type Row = [
  string, string, string, string,
  boolean, boolean, number, string, string,
  string[],
]

const ROWS: Row[] = [
  // — France (clientèle francophone majoritaire) —
  ['Camille Laurent', 'camille.laurent@gmail.com', 'FR', '6 12 45 78 90', true, false, 4, '2025-09-14', '2026-05-28', ['vip', 'tennis']],
  ['Thomas Mercier', 'thomas.mercier@orange.fr', 'FR', '6 88 21 09 34', true, false, 2, '2025-10-02', '2026-04-11', ['padel']],
  ['Léa Dubois', 'lea.dubois@outlook.fr', 'FR', '7 61 34 22 88', false, false, 1, '2025-11-19', '2026-01-09', ['yoga']],
  ['Antoine Garnier', 'antoine.garnier@gmail.com', 'FR', '6 50 77 12 03', true, false, 3, '2025-09-30', '2026-06-02', ['fitness', 'expat']],
  ['Manon Rousseau', 'manon.rousseau@gmail.com', 'FR', '', false, false, 1, '2026-02-12', '2026-02-20', []],
  ['Hugo Lefèvre', 'hugo.lefevre@yahoo.fr', 'FR', '6 24 88 55 17', true, true, 2, '2025-10-21', '2026-03-15', ['padel']],
  ['Chloé Bernard', 'chloe.bernard@gmail.com', 'FR', '7 70 19 44 26', true, false, 5, '2025-09-08', '2026-06-05', ['vip', 'yoga']],
  ['Nicolas Petit', 'nicolas.petit@free.fr', 'FR', '6 13 27 90 41', false, false, 1, '2026-03-04', '2026-03-19', []],
  ['Sarah Moreau', 'sarah.moreau@gmail.com', 'FR', '6 95 02 71 38', true, false, 2, '2025-12-11', '2026-05-02', ['tennis']],
  ['Julien Faure', 'julien.faure@gmail.com', 'FR', '7 58 66 13 09', false, false, 1, '2026-04-22', '2026-05-10', ['fitness']],
  ['Élodie Girard', 'elodie.girard@hotmail.fr', 'FR', '6 41 30 88 52', true, false, 3, '2025-11-02', '2026-04-28', ['yoga', 'expat']],

  // — Royaume-Uni —
  ['James Carter', 'james.carter@gmail.com', 'GB', '7700 900145', true, false, 3, '2025-09-25', '2026-05-21', ['tennis']],
  ['Olivia Wright', 'olivia.wright@outlook.com', 'GB', '7700 900782', true, false, 2, '2025-10-18', '2026-03-30', ['yoga']],
  ['Harry Evans', 'harry.evans@gmail.com', 'GB', '', false, false, 1, '2026-01-27', '2026-02-14', []],
  ['Sophie Turner', 'sophie.turner@gmail.com', 'GB', '7700 900366', true, true, 2, '2025-11-30', '2026-02-08', ['padel']],
  ['Liam Hughes', 'liam.hughes@gmail.com', 'GB', '7700 900518', false, false, 1, '2026-03-16', '2026-04-03', ['fitness']],
  ['Emma Bennett', 'emma.bennett@gmail.com', 'GB', '7700 900924', true, false, 4, '2025-09-12', '2026-06-01', ['vip', 'tennis']],

  // — Allemagne —
  ['Lukas Müller', 'lukas.mueller@gmail.com', 'DE', '151 23456789', true, false, 3, '2025-10-09', '2026-05-15', ['padel']],
  ['Hannah Schmidt', 'hannah.schmidt@web.de', 'DE', '160 98765432', true, false, 2, '2025-12-03', '2026-04-19', ['yoga']],
  ['Felix Weber', 'felix.weber@gmail.com', 'DE', '', false, false, 1, '2026-02-25', '2026-03-12', []],
  ['Lena Fischer', 'lena.fischer@gmail.com', 'DE', '152 44556677', true, false, 2, '2025-11-14', '2026-05-06', ['fitness']],
  ['Paul Wagner', 'paul.wagner@gmx.de', 'DE', '157 11223344', false, true, 1, '2025-10-28', '2026-01-22', []],

  // — États-Unis —
  ['Michael Johnson', 'michael.johnson@gmail.com', 'US', '202 555 0148', true, false, 2, '2025-10-15', '2026-04-08', ['tennis']],
  ['Jessica Davis', 'jessica.davis@gmail.com', 'US', '305 555 0192', true, false, 3, '2025-09-21', '2026-05-25', ['vip', 'yoga']],
  ['David Wilson', 'david.wilson@gmail.com', 'US', '', false, false, 1, '2026-03-29', '2026-04-15', []],
  ['Ashley Martin', 'ashley.martin@gmail.com', 'US', '415 555 0276', false, false, 1, '2026-01-11', '2026-01-30', ['fitness']],

  // — Thaïlande (locaux & expatriés) —
  ['Somchai Phongtha', 'somchai.p@gmail.com', 'TH', '81 234 5678', true, false, 6, '2025-09-05', '2026-06-08', ['vip', 'expat']],
  ['Ploy Srisai', 'ploy.srisai@gmail.com', 'TH', '92 876 5432', true, false, 4, '2025-10-12', '2026-05-30', ['yoga']],
  ['Niran Wattana', 'niran.wattana@gmail.com', 'TH', '85 112 3344', false, false, 2, '2026-02-03', '2026-04-26', ['tennis']],
  ['Apinya Chai', 'apinya.chai@gmail.com', 'TH', '', false, false, 1, '2026-04-09', '2026-04-30', []],

  // — Australie —
  ['Jack Thompson', 'jack.thompson@gmail.com', 'AU', '412 345 678', true, false, 2, '2025-11-08', '2026-03-22', ['padel']],
  ['Charlotte Lee', 'charlotte.lee@gmail.com', 'AU', '413 987 654', true, false, 3, '2025-10-26', '2026-05-18', ['vip', 'yoga']],
  ['Noah Walker', 'noah.walker@gmail.com', 'AU', '', false, false, 1, '2026-03-07', '2026-03-24', []],

  // — Suisse —
  ['Nina Keller', 'nina.keller@bluewin.ch', 'CH', '76 123 45 67', true, false, 3, '2025-09-18', '2026-05-12', ['vip', 'tennis']],
  ['Marco Brunner', 'marco.brunner@gmail.com', 'CH', '78 987 65 43', false, false, 1, '2026-01-19', '2026-02-06', ['fitness']],
  ['Sofia Meier', 'sofia.meier@gmail.com', 'CH', '79 222 33 44', true, true, 2, '2025-12-07', '2026-02-28', ['yoga']],

  // — Belgique —
  ['Lucas Janssens', 'lucas.janssens@gmail.com', 'BE', '470 12 34 56', true, false, 2, '2025-11-22', '2026-04-14', ['padel']],
  ['Emma Peeters', 'emma.peeters@gmail.com', 'BE', '', false, false, 1, '2026-02-17', '2026-03-05', []],

  // — Pays-Bas —
  ['Daan de Vries', 'daan.devries@gmail.com', 'NL', '6 12345678', true, false, 2, '2025-10-30', '2026-04-21', ['tennis']],
  ['Sanne Bakker', 'sanne.bakker@gmail.com', 'NL', '6 87654321', false, false, 1, '2026-03-21', '2026-04-07', ['yoga']],

  // — Suède —
  ['Erik Lindberg', 'erik.lindberg@gmail.com', 'SE', '70 123 45 67', true, false, 2, '2025-11-04', '2026-03-27', ['fitness']],
  ['Anna Karlsson', 'anna.karlsson@gmail.com', 'SE', '', true, false, 3, '2025-09-28', '2026-05-09', ['vip', 'yoga']],

  // — Italie —
  ['Marco Rossi', 'marco.rossi@gmail.com', 'IT', '320 1234567', true, false, 2, '2025-12-15', '2026-04-30', ['padel']],
  ['Giulia Conti', 'giulia.conti@gmail.com', 'IT', '347 7654321', false, false, 1, '2026-04-02', '2026-04-18', ['tennis']],

  // — Espagne —
  ['Pablo García', 'pablo.garcia@gmail.com', 'ES', '612 345 678', true, false, 2, '2025-10-07', '2026-03-18', ['fitness']],

  // — Canada —
  ['Ethan Tremblay', 'ethan.tremblay@gmail.com', 'CA', '514 555 0123', true, false, 2, '2025-11-26', '2026-04-24', ['tennis']],
  ['Olivia Roy', 'olivia.roy@gmail.com', 'CA', '', false, false, 1, '2026-02-09', '2026-02-27', ['yoga']],

  // — Divers —
  ['Dmitri Volkov', 'dmitri.volkov@gmail.com', 'RU', '912 345 67 89', false, false, 1, '2026-01-15', '2026-02-02', ['padel']],
  ['Wei Tan', 'wei.tan@gmail.com', 'SG', '8123 4567', true, false, 2, '2025-12-20', '2026-05-04', ['vip']],
  ['Ingrid Hansen', 'ingrid.hansen@gmail.com', 'NO', '406 12 345', true, false, 2, '2025-10-22', '2026-04-12', ['yoga']],
  ['Frederik Nielsen', 'frederik.nielsen@gmail.com', 'DK', '20 12 34 56', false, false, 1, '2026-03-25', '2026-04-10', ['fitness']],
]

/** Construit la liste complète de contacts de démo à partir des lignes compactes. */
export function getDemoContacts(): DemoContact[] {
  return ROWS.map((r, i) => {
    const [name, email, iso2, local, optIn, unsub, bookings, createdAt, lastBooking, tags] = r
    const dial = COUNTRY_BY_ISO2[iso2]?.dial ?? ''
    const phone = local ? `${dial} ${local}` : undefined
    const source: string[] = bookings > 0 ? ['booking'] : ['newsletter']
    // Quelques contacts cumulent plusieurs sources (réalisme).
    if (optIn && bookings > 0 && i % 4 === 0) source.push('newsletter')
    // Les habitués « vip » ont un compte espace adhérent (source « member »).
    if (tags.includes('vip')) source.push('member')
    // Désinscription : ~3 semaines après la dernière résa.
    const unsubscribedAt = unsub ? `${lastBooking}T10:00:00.000Z` : null
    return {
      _id: `demo-${i + 1}`,
      email,
      name,
      phone,
      country: iso2,
      source,
      tags,
      newsletterOptIn: optIn && !unsub,
      unsubscribedAt,
      lastBookingAt: lastBooking ? `${lastBooking}T09:00:00.000Z` : null,
      bookingsCount: bookings,
      createdAt: `${createdAt}T08:00:00.000Z`,
      updatedAt: `${lastBooking || createdAt}T09:00:00.000Z`,
    }
  })
}
