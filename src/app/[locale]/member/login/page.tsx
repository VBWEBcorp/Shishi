import type { Metadata } from 'next'
import { Suspense } from 'react'
import { setRequestLocale } from 'next-intl/server'

import { MemberAuth } from './member-auth'

export const metadata: Metadata = {
  title: { absolute: 'Espace adhérent | Shi Shi Samui' },
  robots: { index: false, follow: false },
}

export default async function MemberLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <Suspense fallback={null}>
      <MemberAuth />
    </Suspense>
  )
}
