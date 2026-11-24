'use client'

import { CalendarCheck, CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'

/**
 * Formulaire d'inscription aux séances d'aquagym (lundi et vendredi 9 h).
 * Les dates proposées viennent du serveur (prochaines séances, jours fermés
 * retirés) ; le serveur revérifie tout à l'envoi.
 */

const T = {
  en: {
    seance: 'Class',
    nom: 'Full name',
    email: 'Email',
    phone: 'WhatsApp number',
    personnes: 'Number of people',
    notes: 'Message (optional)',
    envoyer: 'Sign up',
    envoi: 'Sending…',
    okTitre: 'You are signed up',
    okTexte: 'A confirmation is on its way to your inbox. See you at the pool!',
    autre: 'Sign up for another class',
    erreur: 'Something went wrong. Please try again, or message us on WhatsApp.',
    complet: 'full',
    plusDePlace: 'This class is full. Please pick another one.',
    reste: (n: number) => `Only ${n} ${n > 1 ? 'spots' : 'spot'} left in this class.`,
    ferme: 'This class is closed. Please pick another one.',
    aucune: 'No class is open for sign-up at the moment. Message us on WhatsApp.',
    a: 'at',
  },
  fr: {
    seance: 'Séance',
    nom: 'Nom et prénom',
    email: 'E-mail',
    phone: 'Numéro WhatsApp',
    personnes: 'Nombre de personnes',
    notes: 'Message (facultatif)',
    envoyer: 'Je m’inscris',
    envoi: 'Envoi…',
    okTitre: 'Vous êtes inscrit',
    okTexte: 'Une confirmation part dans votre boîte mail. À bientôt à la piscine !',
    autre: 'S’inscrire à une autre séance',
    erreur: 'Une erreur est survenue. Réessayez, ou écrivez-nous sur WhatsApp.',
    complet: 'complet',
    plusDePlace: 'Cette séance est complète. Choisissez-en une autre.',
    reste: (n: number) => `Il ne reste que ${n} ${n > 1 ? 'places' : 'place'} sur cette séance.`,
    ferme: 'Cette séance est fermée. Choisissez-en une autre.',
    aucune: 'Aucune séance n’est ouverte à l’inscription pour le moment. Écrivez-nous sur WhatsApp.',
    a: 'à',
  },
} as const

function libelleSeance(date: string, l: 'en' | 'fr', a: string): string {
  const d = new Date(`${date}T12:00:00Z`)
  const jour = d.toLocaleDateString(l === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
  const texte = `${jour} ${a} ${l === 'fr' ? '9 h' : '9:00 am'}`
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}

const champ =
  'mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[0.95rem] text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30'
const etiquette = 'text-sm font-medium text-foreground'

/** Une séance et ses places libres au moment où la page a été servie. */
export interface Seance {
  date: string
  places: number
}

export function AquagymForm({ locale, seances }: { locale: 'en' | 'fr'; seances: Seance[] }) {
  const t = T[locale]
  const ouvertes = seances.filter((s) => s.places > 0)
  const [date, setDate] = useState(ouvertes[0]?.date ?? '')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [partySize, setPartySize] = useState(1)
  const [notes, setNotes] = useState('')
  const [etat, setEtat] = useState<'idle' | 'envoi' | 'ok'>('idle')
  const [erreur, setErreur] = useState('')

  if (ouvertes.length === 0) {
    return <p className="text-[0.97rem] leading-relaxed text-muted-foreground">{t.aucune}</p>
  }

  if (etat === 'ok') {
    return (
      <div className="rounded-3xl border border-border bg-card p-7">
        <p className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
          <CheckCircle2 className="size-5 text-accent" aria-hidden />
          {t.okTitre}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {libelleSeance(date, locale, t.a)} · {t.okTexte}
        </p>
        <button
          type="button"
          onClick={() => {
            setEtat('idle')
            setNotes('')
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {t.autre}
        </button>
      </div>
    )
  }

  const placesSeance = ouvertes.find((s) => s.date === date)?.places ?? 1

  async function envoyer(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setEtat('envoi')
    try {
      const res = await fetch('/api/aquagym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, name, email, phone, partySize, notes, locale }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        if (data.error === 'session-full') {
          const n = Number(data.places) || 0
          setErreur(n > 0 ? t.reste(n) : t.plusDePlace)
          setEtat('idle')
          return
        }
        setErreur(data.error === 'session-closed' || data.error === 'invalid-session' ? t.ferme : t.erreur)
        setEtat('idle')
        return
      }
      setEtat('ok')
    } catch {
      setErreur(t.erreur)
      setEtat('idle')
    }
  }

  return (
    <form
      onSubmit={envoyer}
      className="grid gap-5 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2 sm:p-8"
    >
      <label className="sm:col-span-2">
        <span className={etiquette}>{t.seance}</span>
        <select
          required
          value={date}
          onChange={(e) => {
            const d = e.target.value
            setDate(d)
            const max = seances.find((s) => s.date === d)?.places ?? 1
            setPartySize((n) => Math.min(n, Math.max(1, max)))
          }}
          className={champ}
        >
          {seances.map((s) => (
            <option key={s.date} value={s.date} disabled={s.places <= 0}>
              {libelleSeance(s.date, locale, t.a)}
              {s.places <= 0 ? ` (${t.complet})` : ''}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className={etiquette}>{t.nom}</span>
        <input
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={champ}
        />
      </label>
      <label>
        <span className={etiquette}>{t.personnes}</span>
        <select
          value={partySize}
          onChange={(e) => setPartySize(Number(e.target.value))}
          className={champ}
        >
          {Array.from({ length: placesSeance }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className={etiquette}>{t.email}</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={champ}
        />
      </label>
      <label>
        <span className={etiquette}>{t.phone}</span>
        <input
          required
          type="tel"
          autoComplete="tel"
          placeholder="+66 …"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={champ}
        />
      </label>
      <label className="sm:col-span-2">
        <span className={etiquette}>{t.notes}</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={champ}
        />
      </label>
      {erreur && (
        <p role="alert" className="text-sm font-medium text-destructive sm:col-span-2">
          {erreur}
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={etat === 'envoi'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105 disabled:opacity-60 sm:w-auto"
        >
          {etat === 'envoi' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <CalendarCheck className="size-4" aria-hidden />
          )}
          {etat === 'envoi' ? t.envoi : t.envoyer}
        </button>
      </div>
    </form>
  )
}
