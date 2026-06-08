import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  // /en et /fr explicites dans l'URL (anglais = langue par défaut)
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
