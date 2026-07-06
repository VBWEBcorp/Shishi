import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { upsertContact } from '@/lib/contacts'
import { Contact } from '@/models/Contact'

/**
 * Liste des contacts CRM (admin uniquement). Recherche ?q=, filtre
 * ?filter=all|optin|unsub. Renvoie les contacts + compteurs pour les onglets.
 */
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const filter = searchParams.get('filter') || 'all'

    const query: Record<string, unknown> = {}
    if (filter === 'optin') {
      query.newsletterOptIn = true
      query.unsubscribedAt = { $in: [null, undefined] }
    } else if (filter === 'unsub') {
      query.unsubscribedAt = { $ne: null }
    }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      query.$or = [{ name: rx }, { email: rx }, { phone: rx }]
    }

    const [contacts, total, optin, unsub] = await Promise.all([
      Contact.find(query).sort({ updatedAt: -1 }).limit(1000).lean(),
      Contact.countDocuments({}),
      Contact.countDocuments({ newsletterOptIn: true, unsubscribedAt: { $in: [null] } }),
      Contact.countDocuments({ unsubscribedAt: { $ne: null } }),
    ])

    return NextResponse.json({ contacts, counts: { all: total, optin, unsub } })
  } catch (error) {
    console.error('Contacts list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Ajout manuel d'un contact (admin uniquement). */
export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid-email' }, { status: 400 })
    }

    const contact = await upsertContact({
      email,
      name: body.name ? String(body.name) : undefined,
      phone: body.phone ? String(body.phone) : undefined,
      country: body.country ? String(body.country) : undefined,
      source: 'manual',
      optIn: body.optIn === true,
      optInSource: 'manual',
    })

    // Tags éventuels passés à l'ajout manuel.
    if (contact && Array.isArray(body.tags) && body.tags.length) {
      contact.tags = Array.from(new Set([...(contact.tags || []), ...body.tags.map(String)]))
      await contact.save()
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Contact create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
