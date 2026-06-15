import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Contact } from '@/models/Contact'

type Params = Promise<{ id: string }>

/**
 * Met à jour un contact (admin) : tags, notes, et opt-in / désinscription
 * newsletter. Champs acceptés : { tags?, notes?, newsletterOptIn?, unsubscribed? }.
 */
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    await connectDB()

    const set: Record<string, unknown> = {}
    if (Array.isArray(body.tags)) set.tags = body.tags.map(String)
    if (typeof body.notes === 'string') set.notes = body.notes

    if (typeof body.newsletterOptIn === 'boolean') {
      set.newsletterOptIn = body.newsletterOptIn
      if (body.newsletterOptIn) {
        set.optInAt = new Date()
        set.optInSource = 'admin'
        set.unsubscribedAt = null
      } else {
        set.optInAt = null
      }
    }
    if (body.unsubscribed === true) {
      set.unsubscribedAt = new Date()
      set.newsletterOptIn = false
    } else if (body.unsubscribed === false) {
      set.unsubscribedAt = null
    }

    const contact = await Contact.findByIdAndUpdate(id, { $set: set }, { new: true })
    if (!contact) {
      return NextResponse.json({ error: 'Contact introuvable' }, { status: 404 })
    }
    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Contact update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Supprime un contact (RGPD : droit à l'effacement). Admin uniquement. */
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()
    const deleted = await Contact.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Contact introuvable' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Contact delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
