import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Contact, type IContact } from '@/models/Contact'

/** Échappe une valeur pour le format CSV (RFC 4180). */
function csv(value: unknown): string {
  const s = value == null ? '' : String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Export CSV de tous les contacts (admin uniquement). */
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const contacts = (await Contact.find({}).sort({ updatedAt: -1 }).lean()) as unknown as IContact[]

    const header = [
      'email', 'nom', 'telephone', 'pays', 'newsletter', 'desinscrit',
      'sources', 'tags', 'reservations', 'derniere_reservation', 'cree_le',
    ]
    const rows = contacts.map((c) =>
      [
        c.email,
        c.name ?? '',
        c.phone ?? '',
        c.country ?? '',
        c.newsletterOptIn ? 'oui' : 'non',
        c.unsubscribedAt ? 'oui' : 'non',
        (c.source ?? []).join('|'),
        (c.tags ?? []).join('|'),
        c.bookingsCount ?? 0,
        c.lastBookingAt ? new Date(c.lastBookingAt).toISOString().slice(0, 10) : '',
        c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '',
      ]
        .map(csv)
        .join(',')
    )

    // BOM pour qu'Excel ouvre l'UTF-8 correctement (accents).
    const body = '﻿' + [header.join(','), ...rows].join('\r\n')
    const stamp = new Date().toISOString().slice(0, 10)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="contacts-shishi-${stamp}.csv"`,
      },
    })
  } catch (error) {
    console.error('Contacts export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
