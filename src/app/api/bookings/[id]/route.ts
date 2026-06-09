import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Booking, type BookingStatus } from '@/models/Booking'

const VALID: BookingStatus[] = ['pending', 'paid', 'cancelled', 'failed']

type Params = Promise<{ id: string }>

/** Met à jour le statut d'une réservation (admin uniquement). */
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    if (!VALID.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    await connectDB()
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true })
    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Supprime une réservation (admin uniquement). */
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()
    const deleted = await Booking.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Booking delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
