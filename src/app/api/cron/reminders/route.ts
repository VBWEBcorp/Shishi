import { NextRequest, NextResponse } from 'next/server'

import { sendBookingReminder } from '@/lib/booking-emails'
import { isDayPass } from '@/lib/availability'
import { connectDB } from '@/lib/db'
import { emailEnabled } from '@/lib/email'
import { Booking } from '@/models/Booking'

export const dynamic = 'force-dynamic'

/** Fenêtre d'envoi : on rappelle dès que la session est à ≤ 1 h (et future). */
const REMINDER_WINDOW_MS = 1 * 60 * 60 * 1000

/** Bangkok = UTC+7 fixe (pas de DST). */
const BKK_OFFSET = '+07:00'
const DAY_MS = 24 * 60 * 60 * 1000

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  if (request.headers.get('authorization') === `Bearer ${secret}`) return true
  return new URL(request.url).searchParams.get('key') === secret
}

/** Dates "YYYY-MM-DD" hier / aujourd'hui / demain à l'heure de Bangkok. */
function bangkokDateStrings(now: Date): { yesterday: string; today: string; tomorrow: string } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return {
    yesterday: fmt.format(new Date(now.getTime() - DAY_MS)),
    today: fmt.format(now),
    tomorrow: fmt.format(new Date(now.getTime() + DAY_MS)),
  }
}

/**
 * Tâche planifiée : envoie un rappel email (~1 h avant) aux clients dont la
 * session approche. Protégée par CRON_SECRET. À-envoi-unique grâce à un
 * « verrou » atomique sur `reminderSentAt` (résiste à deux exécutions
 * simultanées du cron).
 */
export async function GET(request: NextRequest) {
  // Auth unique : 401 que le secret soit absent OU faux (pas de fuite d'info).
  if (!authorized(request)) {
    if (!process.env.CRON_SECRET) console.warn('[cron/reminders] CRON_SECRET non défini')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Sans email configuré, on ne « réclame » aucune réservation (sinon elles
  // seraient marquées rappelées sans qu'aucun email parte).
  if (!emailEnabled) {
    return NextResponse.json({ ok: true, sent: 0, note: 'email-not-configured' })
  }

  try {
    await connectDB()
    const now = new Date()
    const { yesterday, today, tomorrow } = bangkokDateStrings(now)

    // Candidats : réservations actives, pas encore rappelées. La fenêtre de 1 h
    // ne peut concerner que hier/aujourd'hui/demain (Bangkok) ; le garde `diff`
    // ci-dessous décide réellement de l'envoi.
    const candidates = await Booking.find({
      status: { $in: ['pending', 'paid'] },
      reminderSentAt: { $exists: false },
      date: { $in: [yesterday, today, tomorrow] },
    }).limit(300)

    let sent = 0
    let due = 0

    for (const b of candidates) {
      // Accès à la journée (salle de sport, piscine) : pas de rappel « 1 h avant ».
      if (isDayPass(b.activitySlug)) continue
      const start = new Date(`${b.date}T${b.time}:00${BKK_OFFSET}`)
      const diff = start.getTime() - now.getTime()
      if (diff <= 0 || diff > REMINDER_WINDOW_MS) continue
      due++

      // Verrou atomique : seule la 1re exécution qui pose `reminderSentAt`
      // obtient le document → un seul email même si deux crons se chevauchent.
      const claimed = await Booking.findOneAndUpdate(
        { _id: b._id, reminderSentAt: { $exists: false } },
        { $set: { reminderSentAt: new Date() } }
      )
      if (!claimed) continue

      const res = await sendBookingReminder({
        name: b.name,
        email: b.email,
        activityName: b.activityName,
        date: b.date,
        time: b.time,
        duration: b.duration,
        locale: b.locale === 'fr' ? 'fr' : 'en',
      })

      if (res?.ok) {
        sent++
      } else {
        // Échec d'envoi : on relâche le verrou pour réessayer au prochain passage.
        await Booking.updateOne({ _id: b._id }, { $unset: { reminderSentAt: 1 } })
      }
    }

    return NextResponse.json({ ok: true, checked: candidates.length, due, sent })
  } catch (error) {
    console.error('[cron/reminders] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
