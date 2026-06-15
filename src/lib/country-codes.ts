/**
 * Indicatifs téléphoniques internationaux — le club accueille des clients de
 * tous les pays, le numéro est donc toujours saisi avec son indicatif (+33, +66…).
 *
 * Le drapeau emoji est calculé depuis le code ISO2 (pas stocké), ce qui évite
 * les erreurs de saisie et garde la liste légère.
 */

export interface Country {
  /** Code ISO 3166-1 alpha-2 (FR, TH…). */
  iso2: string
  /** Indicatif international, avec le « + ». */
  dial: string
  /** Nom affiché. */
  name: string
}

/** Drapeau emoji à partir du code ISO2 (🇫🇷, 🇹🇭…). */
export function flagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

/** Pays mis en avant en haut de la liste (lieu + clientèle FR/EU). */
export const PRIORITY_ISO2 = ['TH', 'FR', 'GB', 'DE', 'US', 'CH', 'BE', 'AU']

/** Pays présélectionné selon la langue de la page. */
export const DEFAULT_ISO2: Record<'fr' | 'en', string> = { fr: 'FR', en: 'TH' }

/**
 * Pays où le français est la langue courante. Sert à choisir la langue de
 * l'email client : tél. d'un de ces pays → email en français, sinon anglais
 * par défaut. Liste ajustable selon la clientèle.
 */
const FRENCH_SPEAKING_ISO2 = new Set([
  'FR', 'BE', 'CH', 'LU', 'MC', // Europe francophone
  'CI', 'SN', 'ML', 'BF', 'NE', 'TG', 'BJ', 'GA', 'CG', 'CD', 'GN', 'CF', 'TD', 'CM', 'KM', 'DJ', 'MG', 'RW', 'SC', // Afrique francophone
  'DZ', 'MA', 'TN', // Maghreb
  'HT', 'VU', // Haïti, Vanuatu
])

/** Langue de l'email client d'après le pays du téléphone (fr si francophone, sinon en). */
export function langFromPhoneCountry(iso2?: string): 'fr' | 'en' {
  return iso2 && FRENCH_SPEAKING_ISO2.has(iso2.toUpperCase()) ? 'fr' : 'en'
}

export const COUNTRIES: Country[] = [
  { iso2: 'AF', dial: '+93', name: 'Afghanistan' },
  { iso2: 'AL', dial: '+355', name: 'Albanie' },
  { iso2: 'DZ', dial: '+213', name: 'Algérie' },
  { iso2: 'AD', dial: '+376', name: 'Andorre' },
  { iso2: 'AO', dial: '+244', name: 'Angola' },
  { iso2: 'AR', dial: '+54', name: 'Argentine' },
  { iso2: 'AM', dial: '+374', name: 'Arménie' },
  { iso2: 'AU', dial: '+61', name: 'Australie' },
  { iso2: 'AT', dial: '+43', name: 'Autriche' },
  { iso2: 'AZ', dial: '+994', name: 'Azerbaïdjan' },
  { iso2: 'BS', dial: '+1', name: 'Bahamas' },
  { iso2: 'BH', dial: '+973', name: 'Bahreïn' },
  { iso2: 'BD', dial: '+880', name: 'Bangladesh' },
  { iso2: 'BB', dial: '+1', name: 'Barbade' },
  { iso2: 'BY', dial: '+375', name: 'Biélorussie' },
  { iso2: 'BE', dial: '+32', name: 'Belgique' },
  { iso2: 'BZ', dial: '+501', name: 'Belize' },
  { iso2: 'BJ', dial: '+229', name: 'Bénin' },
  { iso2: 'BT', dial: '+975', name: 'Bhoutan' },
  { iso2: 'BO', dial: '+591', name: 'Bolivie' },
  { iso2: 'BA', dial: '+387', name: 'Bosnie-Herzégovine' },
  { iso2: 'BW', dial: '+267', name: 'Botswana' },
  { iso2: 'BR', dial: '+55', name: 'Brésil' },
  { iso2: 'BN', dial: '+673', name: 'Brunei' },
  { iso2: 'BG', dial: '+359', name: 'Bulgarie' },
  { iso2: 'BF', dial: '+226', name: 'Burkina Faso' },
  { iso2: 'BI', dial: '+257', name: 'Burundi' },
  { iso2: 'KH', dial: '+855', name: 'Cambodge' },
  { iso2: 'CM', dial: '+237', name: 'Cameroun' },
  { iso2: 'CA', dial: '+1', name: 'Canada' },
  { iso2: 'CV', dial: '+238', name: 'Cap-Vert' },
  { iso2: 'CF', dial: '+236', name: 'République centrafricaine' },
  { iso2: 'TD', dial: '+235', name: 'Tchad' },
  { iso2: 'CL', dial: '+56', name: 'Chili' },
  { iso2: 'CN', dial: '+86', name: 'Chine' },
  { iso2: 'CO', dial: '+57', name: 'Colombie' },
  { iso2: 'KM', dial: '+269', name: 'Comores' },
  { iso2: 'CD', dial: '+243', name: 'Congo (RDC)' },
  { iso2: 'CG', dial: '+242', name: 'Congo' },
  { iso2: 'CR', dial: '+506', name: 'Costa Rica' },
  { iso2: 'CI', dial: '+225', name: "Côte d'Ivoire" },
  { iso2: 'HR', dial: '+385', name: 'Croatie' },
  { iso2: 'CU', dial: '+53', name: 'Cuba' },
  { iso2: 'CY', dial: '+357', name: 'Chypre' },
  { iso2: 'CZ', dial: '+420', name: 'Tchéquie' },
  { iso2: 'DK', dial: '+45', name: 'Danemark' },
  { iso2: 'DJ', dial: '+253', name: 'Djibouti' },
  { iso2: 'DO', dial: '+1', name: 'République dominicaine' },
  { iso2: 'EC', dial: '+593', name: 'Équateur' },
  { iso2: 'EG', dial: '+20', name: 'Égypte' },
  { iso2: 'SV', dial: '+503', name: 'Salvador' },
  { iso2: 'EE', dial: '+372', name: 'Estonie' },
  { iso2: 'ET', dial: '+251', name: 'Éthiopie' },
  { iso2: 'FJ', dial: '+679', name: 'Fidji' },
  { iso2: 'FI', dial: '+358', name: 'Finlande' },
  { iso2: 'FR', dial: '+33', name: 'France' },
  { iso2: 'GA', dial: '+241', name: 'Gabon' },
  { iso2: 'GM', dial: '+220', name: 'Gambie' },
  { iso2: 'GE', dial: '+995', name: 'Géorgie' },
  { iso2: 'DE', dial: '+49', name: 'Allemagne' },
  { iso2: 'GH', dial: '+233', name: 'Ghana' },
  { iso2: 'GR', dial: '+30', name: 'Grèce' },
  { iso2: 'GT', dial: '+502', name: 'Guatemala' },
  { iso2: 'GN', dial: '+224', name: 'Guinée' },
  { iso2: 'GY', dial: '+592', name: 'Guyana' },
  { iso2: 'HT', dial: '+509', name: 'Haïti' },
  { iso2: 'HN', dial: '+504', name: 'Honduras' },
  { iso2: 'HK', dial: '+852', name: 'Hong Kong' },
  { iso2: 'HU', dial: '+36', name: 'Hongrie' },
  { iso2: 'IS', dial: '+354', name: 'Islande' },
  { iso2: 'IN', dial: '+91', name: 'Inde' },
  { iso2: 'ID', dial: '+62', name: 'Indonésie' },
  { iso2: 'IR', dial: '+98', name: 'Iran' },
  { iso2: 'IQ', dial: '+964', name: 'Irak' },
  { iso2: 'IE', dial: '+353', name: 'Irlande' },
  { iso2: 'IL', dial: '+972', name: 'Israël' },
  { iso2: 'IT', dial: '+39', name: 'Italie' },
  { iso2: 'JM', dial: '+1', name: 'Jamaïque' },
  { iso2: 'JP', dial: '+81', name: 'Japon' },
  { iso2: 'JO', dial: '+962', name: 'Jordanie' },
  { iso2: 'KZ', dial: '+7', name: 'Kazakhstan' },
  { iso2: 'KE', dial: '+254', name: 'Kenya' },
  { iso2: 'KW', dial: '+965', name: 'Koweït' },
  { iso2: 'KG', dial: '+996', name: 'Kirghizistan' },
  { iso2: 'LA', dial: '+856', name: 'Laos' },
  { iso2: 'LV', dial: '+371', name: 'Lettonie' },
  { iso2: 'LB', dial: '+961', name: 'Liban' },
  { iso2: 'LS', dial: '+266', name: 'Lesotho' },
  { iso2: 'LR', dial: '+231', name: 'Liberia' },
  { iso2: 'LY', dial: '+218', name: 'Libye' },
  { iso2: 'LI', dial: '+423', name: 'Liechtenstein' },
  { iso2: 'LT', dial: '+370', name: 'Lituanie' },
  { iso2: 'LU', dial: '+352', name: 'Luxembourg' },
  { iso2: 'MO', dial: '+853', name: 'Macao' },
  { iso2: 'MG', dial: '+261', name: 'Madagascar' },
  { iso2: 'MW', dial: '+265', name: 'Malawi' },
  { iso2: 'MY', dial: '+60', name: 'Malaisie' },
  { iso2: 'MV', dial: '+960', name: 'Maldives' },
  { iso2: 'ML', dial: '+223', name: 'Mali' },
  { iso2: 'MT', dial: '+356', name: 'Malte' },
  { iso2: 'MR', dial: '+222', name: 'Mauritanie' },
  { iso2: 'MU', dial: '+230', name: 'Maurice' },
  { iso2: 'MX', dial: '+52', name: 'Mexique' },
  { iso2: 'MD', dial: '+373', name: 'Moldavie' },
  { iso2: 'MC', dial: '+377', name: 'Monaco' },
  { iso2: 'MN', dial: '+976', name: 'Mongolie' },
  { iso2: 'ME', dial: '+382', name: 'Monténégro' },
  { iso2: 'MA', dial: '+212', name: 'Maroc' },
  { iso2: 'MZ', dial: '+258', name: 'Mozambique' },
  { iso2: 'MM', dial: '+95', name: 'Myanmar (Birmanie)' },
  { iso2: 'NA', dial: '+264', name: 'Namibie' },
  { iso2: 'NP', dial: '+977', name: 'Népal' },
  { iso2: 'NL', dial: '+31', name: 'Pays-Bas' },
  { iso2: 'NZ', dial: '+64', name: 'Nouvelle-Zélande' },
  { iso2: 'NI', dial: '+505', name: 'Nicaragua' },
  { iso2: 'NE', dial: '+227', name: 'Niger' },
  { iso2: 'NG', dial: '+234', name: 'Nigeria' },
  { iso2: 'MK', dial: '+389', name: 'Macédoine du Nord' },
  { iso2: 'NO', dial: '+47', name: 'Norvège' },
  { iso2: 'OM', dial: '+968', name: 'Oman' },
  { iso2: 'PK', dial: '+92', name: 'Pakistan' },
  { iso2: 'PA', dial: '+507', name: 'Panama' },
  { iso2: 'PG', dial: '+675', name: 'Papouasie-Nouvelle-Guinée' },
  { iso2: 'PY', dial: '+595', name: 'Paraguay' },
  { iso2: 'PE', dial: '+51', name: 'Pérou' },
  { iso2: 'PH', dial: '+63', name: 'Philippines' },
  { iso2: 'PL', dial: '+48', name: 'Pologne' },
  { iso2: 'PT', dial: '+351', name: 'Portugal' },
  { iso2: 'QA', dial: '+974', name: 'Qatar' },
  { iso2: 'RO', dial: '+40', name: 'Roumanie' },
  { iso2: 'RU', dial: '+7', name: 'Russie' },
  { iso2: 'RW', dial: '+250', name: 'Rwanda' },
  { iso2: 'SA', dial: '+966', name: 'Arabie saoudite' },
  { iso2: 'SN', dial: '+221', name: 'Sénégal' },
  { iso2: 'RS', dial: '+381', name: 'Serbie' },
  { iso2: 'SC', dial: '+248', name: 'Seychelles' },
  { iso2: 'SL', dial: '+232', name: 'Sierra Leone' },
  { iso2: 'SG', dial: '+65', name: 'Singapour' },
  { iso2: 'SK', dial: '+421', name: 'Slovaquie' },
  { iso2: 'SI', dial: '+386', name: 'Slovénie' },
  { iso2: 'SO', dial: '+252', name: 'Somalie' },
  { iso2: 'ZA', dial: '+27', name: 'Afrique du Sud' },
  { iso2: 'KR', dial: '+82', name: 'Corée du Sud' },
  { iso2: 'ES', dial: '+34', name: 'Espagne' },
  { iso2: 'LK', dial: '+94', name: 'Sri Lanka' },
  { iso2: 'SD', dial: '+249', name: 'Soudan' },
  { iso2: 'SE', dial: '+46', name: 'Suède' },
  { iso2: 'CH', dial: '+41', name: 'Suisse' },
  { iso2: 'SY', dial: '+963', name: 'Syrie' },
  { iso2: 'TW', dial: '+886', name: 'Taïwan' },
  { iso2: 'TJ', dial: '+992', name: 'Tadjikistan' },
  { iso2: 'TZ', dial: '+255', name: 'Tanzanie' },
  { iso2: 'TH', dial: '+66', name: 'Thaïlande' },
  { iso2: 'TG', dial: '+228', name: 'Togo' },
  { iso2: 'TT', dial: '+1', name: 'Trinité-et-Tobago' },
  { iso2: 'TN', dial: '+216', name: 'Tunisie' },
  { iso2: 'TR', dial: '+90', name: 'Turquie' },
  { iso2: 'TM', dial: '+993', name: 'Turkménistan' },
  { iso2: 'UG', dial: '+256', name: 'Ouganda' },
  { iso2: 'UA', dial: '+380', name: 'Ukraine' },
  { iso2: 'AE', dial: '+971', name: 'Émirats arabes unis' },
  { iso2: 'GB', dial: '+44', name: 'Royaume-Uni' },
  { iso2: 'US', dial: '+1', name: 'États-Unis' },
  { iso2: 'UY', dial: '+598', name: 'Uruguay' },
  { iso2: 'UZ', dial: '+998', name: 'Ouzbékistan' },
  { iso2: 'VE', dial: '+58', name: 'Venezuela' },
  { iso2: 'VN', dial: '+84', name: 'Viêt Nam' },
  { iso2: 'YE', dial: '+967', name: 'Yémen' },
  { iso2: 'ZM', dial: '+260', name: 'Zambie' },
  { iso2: 'ZW', dial: '+263', name: 'Zimbabwe' },
]

/** Index par ISO2 pour résolution rapide. */
export const COUNTRY_BY_ISO2: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.iso2, c])
)

/** Liste ordonnée : pays prioritaires en tête, puis le reste alphabétique. */
export const COUNTRIES_ORDERED: Country[] = [
  ...PRIORITY_ISO2.map((iso) => COUNTRY_BY_ISO2[iso]).filter(Boolean),
  ...[...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
]
