// scripts/test-reminder.js
//
// Test de la relance « 1 h avant » : insère une réservation bidon dont l'heure
// (en heure de Bangkok, UTC+7) tombe dans ~45 min, puis déclenche le cron
// /api/cron/reminders. Tu reçois alors le vrai mail de rappel (adresse du lieu
// + bouton itinéraire) sur l'adresse choisie.
//
// Lancer (dev server démarré) :
//   node scripts/test-reminder.js                 → envoie à contact@shi-shi-samui.com
//   node scripts/test-reminder.js toi@mail.com    → envoie à l'adresse donnée
//   node scripts/test-reminder.js toi@mail.com https://shi-shi-samui.com   → cible la prod
//
// La résa de test est supprimée automatiquement une fois le rappel parti.

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const EMAIL = process.argv[2] || process.env.CONTACT_TO_EMAIL || 'contact@shi-shi-samui.com'
const BASE = process.argv[3] || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const SECRET = process.env.CRON_SECRET
const MINUTES_AHEAD = 45 // dans la fenêtre d'1 h → le cron déclenche l'envoi

// Schéma minimal aligné sur src/models/Booking.ts (même collection « bookings »).
const BookingSchema = new mongoose.Schema(
  {
    activitySlug: String,
    activityName: String,
    date: String, // YYYY-MM-DD
    time: String, // HH:mm
    duration: Number,
    name: String,
    email: String,
    phone: String,
    notes: String,
    amount: Number,
    currency: String,
    status: String,
    locale: String,
    seen: Boolean,
    reminderSentAt: Date,
  },
  { timestamps: true }
)
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema)

/** Date (YYYY-MM-DD) et heure (HH:mm) d'un instant, exprimées en heure de Bangkok. */
function bangkokParts(d) {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
  return { date, time }
}

;(async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI manquant (vérifie .env.local)')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)

  const target = new Date(Date.now() + MINUTES_AHEAD * 60 * 1000)
  const { date, time } = bangkokParts(target)

  const booking = await Booking.create({
    activitySlug: 'tennis',
    activityName: 'Tennis',
    date,
    time,
    duration: 60,
    name: 'Test Relance',
    email: EMAIL,
    amount: 500,
    currency: 'thb',
    status: 'pending',
    locale: 'fr',
    seen: true, // ne pas faire sonner la cloche admin pour une résa de test
  })

  console.log(`Résa de test créée : ${booking._id}`)
  console.log(`  → ${date} à ${time} (heure de Bangkok), dans ~${MINUTES_AHEAD} min`)
  console.log(`  → destinataire : ${EMAIL}`)

  if (!SECRET) {
    console.warn('\nCRON_SECRET manquant : impossible de déclencher le cron automatiquement.')
    console.warn('Ajoute-le dans .env.local, ou ouvre l\'URL du cron à la main.')
    await mongoose.disconnect()
    return
  }

  const url = `${BASE}/api/cron/reminders?key=${SECRET}`
  console.log(`\nDéclenchement du cron : ${url.replace(SECRET, '***')}`)

  try {
    const res = await fetch(url)
    const body = await res.text()
    console.log(`Réponse cron : ${res.status} ${body}`)

    if (res.ok) {
      await Booking.deleteOne({ _id: booking._id })
      console.log('Résa de test supprimée. Vérifie ta boîte mail 📬')
    } else {
      console.warn('Le cron n\'a pas répondu 2xx — la résa de test est conservée pour réessayer.')
    }
  } catch (err) {
    console.warn(`\nCron injoignable (${err.message}).`)
    console.warn('Démarre le serveur (npm run dev) puis ouvre l\'URL ci-dessus dans le navigateur.')
    console.warn(`La résa de test (${booking._id}) est conservée — supprime-la ensuite depuis /admin/bookings.`)
  }

  await mongoose.disconnect()
})().catch((err) => {
  console.error('Erreur :', err.message)
  process.exit(1)
})
