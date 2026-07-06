/**
 * Seed de démonstration — réservations + quelques comptes membres.
 *
 * But : peupler l'espace admin (Réservations & Membres) avec des données
 * réalistes pour visualiser l'interface — dont les badges membre / crédits /
 * remise et le panneau « demandes à valider ».
 *
 * · Insertion DIRECTE en base (aucun email/WhatsApp déclenché).
 * · Ré-exécutable : purge d'abord la démo (résas `stripeSessionId='demo-seed'`,
 *   membres `@demo.shishi.com`).
 * · Nettoyage seul :  node scripts/seed-bookings.js --clean
 *
 * Usage :  node scripts/seed-bookings.js
 */
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI manquant dans .env.local')
  process.exit(1)
}

// Schémas souples (strict:false) — on n'a besoin que d'écrire/purger la démo.
const Booking = mongoose.model(
  'Booking',
  new mongoose.Schema({}, { strict: false, timestamps: true, collection: 'bookings' })
)
const User = mongoose.model(
  'User',
  new mongoose.Schema({}, { strict: false, timestamps: true, collection: 'users' })
)

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()

/** yyyy-mm-dd à N jours d'aujourd'hui (heure locale). */
function day(offset) {
  const d = new Date(now + offset * DAY)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dd}`
}

async function seedMembers() {
  const password = await bcrypt.hash('Demo@123456', await bcrypt.genSalt(10))
  const members = [
    {
      email: 'marie.laurent@demo.shishi.com',
      name: 'Marie Laurent',
      phone: '+33 6 12 34 56 78',
      plan: 'silver',
      credits: 13,
      renewAt: new Date(now + 26 * DAY),
      memberSince: new Date(now - 40 * DAY),
    },
    {
      email: 'tom.becker@demo.shishi.com',
      name: 'Tom Becker',
      phone: '+66 81 234 5678',
      plan: 'bronze',
      credits: 7,
      renewAt: new Date(now + 19 * DAY),
      memberSince: new Date(now - 12 * DAY),
    },
    {
      // Demande d'abonnement en attente → alimente le panneau « à valider ».
      email: 'sofia.rossi@demo.shishi.com',
      name: 'Sofia Rossi',
      phone: '+39 340 111 2233',
      plan: 'none',
      credits: 0,
      pendingPlan: 'gold',
    },
  ]

  const ids = {}
  for (const m of members) {
    const doc = await User.findOneAndUpdate(
      { email: m.email },
      { ...m, password, role: 'user' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    ids[m.name] = String(doc._id)
  }
  return ids
}

function buildBookings(memberIds) {
  const marie = memberIds['Marie Laurent']
  const tom = memberIds['Tom Becker']

  /** Fabrique une réservation de démo (marquée via stripeSessionId = 'demo-seed'). */
  const b = (o) => ({
    currency: 'thb',
    partySize: 1,
    creditsUsed: 0,
    discountRate: 0,
    locale: 'fr',
    seen: false,
    stripeSessionId: 'demo-seed',
    ...o,
  })

  return [
    // ── Clients de passage ────────────────────────────────────────────────
    b({ activitySlug: 'tennis', activityName: 'Tennis', date: day(2), time: '09:00', duration: 60,
        name: 'Victor Béasse', email: 'victor@example.com', phone: '+33 6 27 30 17 88',
        amount: 600, status: 'pending', notes: 'Première visite, prévoir raquettes.' }),
    b({ activitySlug: 'fitness', activityName: 'Fitness', date: day(2), time: '18:00', duration: 60,
        name: 'Emma Wilson', email: 'emma.wilson@example.com', phone: '+44 7700 900123',
        amount: 250, status: 'paid' }),
    b({ activitySlug: 'kids-club', activityName: 'Kids Club', date: day(3), time: '10:00', duration: 120,
        name: 'Julie Martin', email: 'julie.martin@example.com', phone: '+33 6 98 76 54 32',
        amount: 400, status: 'pending', notes: '2 heures — enfant de 5 ans.' }),
    b({ activitySlug: 'pool', activityName: 'Piscine', date: day(4), time: '11:00', duration: 60,
        name: 'Liam Chen', email: 'liam.chen@example.com', phone: '+65 8123 4567',
        amount: 100, status: 'paid' }),
    b({ activitySlug: 'tennis', activityName: 'Tennis', date: day(6), time: '17:00', duration: 60,
        name: 'Noah Dubois', email: 'noah.dubois@example.com', phone: '+33 7 11 22 33 44',
        amount: 600, status: 'pending', partySize: 2,
        participants: [{ name: 'Chloé Dubois', email: 'chloe.dubois@example.com', phone: '' }] }),
    b({ activitySlug: 'fitness', activityName: 'Fitness', date: day(0), time: '08:00', duration: 60,
        name: 'Sarah Kim', email: 'sarah.kim@example.com', phone: '+82 10 1234 5678',
        amount: 250, status: 'paid' }),
    b({ activitySlug: 'tennis', activityName: 'Tennis', date: day(-8), time: '10:00', duration: 60,
        name: 'Alex Moreau', email: 'alex.moreau@example.com', phone: '+33 6 55 44 33 22',
        amount: 600, status: 'cancelled', notes: 'Annulé par le client (météo).' }),

    // ── Réservations membres (badges Membre / crédits / remise) ────────────
    // Marie (Silver) — couvert par les crédits (montant à 0 → « Crédits »).
    b({ activitySlug: 'tennis', activityName: 'Tennis', date: day(3), time: '08:00', duration: 60,
        name: 'Marie Laurent', email: 'marie.laurent@demo.shishi.com', phone: '+33 6 12 34 56 78',
        amount: 0, status: 'paid', memberId: marie, creditsUsed: 1, discountRate: 0.2 }),
    // Tom (Bronze) — plus de crédits : remise 10 % appliquée (250 → 225).
    b({ activitySlug: 'fitness', activityName: 'Fitness', date: day(5), time: '19:00', duration: 60,
        name: 'Tom Becker', email: 'tom.becker@demo.shishi.com', phone: '+66 81 234 5678',
        amount: 225, status: 'pending', memberId: tom, creditsUsed: 0, discountRate: 0.1 }),
    // Marie (Silver) — Kids Club 2 h réglé en crédits (2 crédits).
    b({ activitySlug: 'kids-club', activityName: 'Kids Club', date: day(8), time: '09:00', duration: 120,
        name: 'Marie Laurent', email: 'marie.laurent@demo.shishi.com', phone: '+33 6 12 34 56 78',
        amount: 0, status: 'paid', memberId: marie, creditsUsed: 2, discountRate: 0.2 }),
    // Tom (Bronze) — Tennis réglé en crédits (1 crédit).
    b({ activitySlug: 'tennis', activityName: 'Tennis', date: day(9), time: '16:00', duration: 60,
        name: 'Tom Becker', email: 'tom.becker@demo.shishi.com', phone: '+66 81 234 5678',
        amount: 0, status: 'pending', memberId: tom, creditsUsed: 1, discountRate: 0.1 }),
  ]
}

async function main() {
  const clean = process.argv.includes('--clean')
  console.log('🔗 Connexion à MongoDB…')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connecté !')

  // Purge des données de démo précédentes (idempotence).
  const delB = await Booking.deleteMany({ stripeSessionId: 'demo-seed' })
  const delU = await User.deleteMany({ email: /@demo\.shishi\.com$/ })
  console.log(`🧹 Purge démo : ${delB.deletedCount} réservation(s), ${delU.deletedCount} membre(s).`)

  if (clean) {
    console.log('✨ Nettoyage terminé (option --clean).')
    await mongoose.disconnect()
    process.exit(0)
  }

  const memberIds = await seedMembers()
  console.log(`👤 ${Object.keys(memberIds).length} comptes membres de démo créés (dont 1 demande à valider).`)

  const bookings = buildBookings(memberIds)
  await Booking.insertMany(bookings)
  console.log(`📅 ${bookings.length} réservations de démo créées.`)

  console.log('\n✅ Terminé. Ouvre /admin/bookings et /admin/members pour voir les données.')
  console.log('   Pour tout retirer :  node scripts/seed-bookings.js --clean\n')
  await mongoose.disconnect()
  process.exit(0)
}

main().catch(async (err) => {
  console.error('❌ Erreur :', err.message)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})
