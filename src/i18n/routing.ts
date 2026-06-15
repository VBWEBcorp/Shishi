import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  // /en et /fr explicites dans l'URL (anglais = langue par défaut)
  localePrefix: 'always',
  // Pas de détection auto (navigateur/cookie) : tout le monde arrive en anglais ;
  // le français ne s'active que via le sélecteur de langue (→ /fr explicite).
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
