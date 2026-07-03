import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { signMemberToken, setMemberCookie } from '@/lib/member-auth'
import { memberSummary } from '@/lib/member-summary'

/** Connexion adhérent : vérifie les identifiants et ouvre la session. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return NextResponse.json({ error: 'missing-fields' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: 'invalid-credentials' }, { status: 401 })
    }

    const token = signMemberToken({ id: String(user._id), email: user.email })
    const res = NextResponse.json({ ok: true, member: memberSummary(user) })
    setMemberCookie(res, token)
    return res
  } catch (error) {
    console.error('[member/login] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
