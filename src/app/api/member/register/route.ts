import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { upsertContact } from '@/lib/contacts'
import { signMemberToken, setMemberCookie } from '@/lib/member-auth'
import { memberSummary } from '@/lib/member-summary'

/** Inscription adhérent : crée un compte (sans abonnement) et ouvre la session. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const name = String(body.name || '').trim()
    const phone = String(body.phone || '').trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid-email' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'weak-password' }, { status: 400 })
    }

    await connectDB()
    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: 'email-taken' }, { status: 409 })
    }

    const user = await User.create({
      email,
      password,
      name,
      phone,
      role: 'user',
      plan: 'none',
      credits: 0,
    })

    // CRM : le nouvel adhérent devient un contact (best-effort).
    try {
      await upsertContact({ email, name, phone, source: 'member', optIn: true, optInSource: 'member-signup' })
    } catch (e) {
      console.error('[member/register] contact upsert failed:', e)
    }

    const token = signMemberToken({ id: String(user._id), email })
    const res = NextResponse.json({ ok: true, member: memberSummary(user) })
    setMemberCookie(res, token)
    return res
  } catch (error) {
    console.error('[member/register] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
