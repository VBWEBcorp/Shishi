import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { MemberDashboard } from './dashboard'

export const metadata: Metadata = {
  title: { absolute: 'Espace adhérent | Shi Shi Samui' },
  robots: { index: false, follow: false },
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <MemberDashboard />
}
