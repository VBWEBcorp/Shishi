'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, CalendarSearch, Check, Loader2, Mail, MessageCircle, Plus, Trash2, Users, Wallet } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { ActivitySelect } from '@/components/activity-select'
import { Button } from '@/components/ui/button'
import { DatePopover } from '@/components/date-popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/phone-input'
import { DEFAULT_ISO2 } from '@/lib/country-codes'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { isBookable, isDayPass } from '@/lib/availability'
import { getActivityPrice, isPricePerPerson } from '@/lib/booking-pricing'
import { siteConfig } from '@/lib/seo'

type Status = 'idle' | 'submitting' | 'request-received' | 'error'

interface Slot {
  time: string
  available: number
  capacity: number
}

interface Participant {
  name: string
  email: string
  phone: string
}

const waMessage = encodeURIComponent("Hi Shi Shi Samui! I'd like to book a session.")
const waLink = `https://wa.me/${siteConfig.whatsapp}?text=${waMessage}`

export function BookingForm({
  initialActivity,
  initialDate,
  variant = 'page',
}: {
  /** Pré-remplissage direct (utilisé par le popup d'accueil). Prioritaire sur l'URL. */
  initialActivity?: string
  initialDate?: string
  /** `dialog` = rendu dans le popup (pas de scroll auto, pas de bandeaux d'URL). */
  variant?: 'page' | 'dialog'
} = {}) {
  const t = useTranslations('Booking')
  const locale = useLocale() as Locale
  const params = useSearchParams()

  // Pré-remplissage : props (popup) prioritaires, sinon l'URL (page /book-now).
  const presetActivity = initialActivity ?? params.get('activity') ?? ''
  const presetDate = initialDate ?? params.get('date') ?? ''
  const validActivity = activities.some((a) => a.slug === presetActivity) ? presetActivity : ''

  const [activitySlug, setActivitySlug] = useState(validActivity)
  const [date, setDate] = useState(presetDate)
  const [today, setToday] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')

  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Réservation pour plusieurs personnes : participants additionnels (hors titulaire).
  const [participants, setParticipants] = useState<Participant[]>([])
  const addParticipant = () =>
    setParticipants((list) => [...list, { name: '', email: '', phone: '' }])
  const removeParticipant = (i: number) =>
    setParticipants((list) => list.filter((_, idx) => idx !== i))
  const updateParticipant = (i: number, field: keyof Participant, value: string) =>
    setParticipants((list) => list.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)))

  const bookable = activitySlug ? isBookable(activitySlug) : true
  // Accès à la journée (salle de sport, piscine) : pas d'horaires, un seul choix.
  const dayPass = activitySlug ? isDayPass(activitySlug) : false

  // Prix : tarif unitaire + total selon le nombre de participants.
  const fr = locale === 'fr'
  const unitPrice = activitySlug ? getActivityPrice(activitySlug) : 0
  const perPerson = activitySlug ? isPricePerPerson(activitySlug) : false
  const partySize = 1 + participants.length
  const total = perPerson ? unitPrice * partySize : unitPrice
  const unitWord = dayPass ? (fr ? 'jour' : 'day') : fr ? 'heure' : 'hour'
  const fmtPrice = (n: number) => n.toLocaleString(fr ? 'fr-FR' : 'en-GB')

  // Synchronise l'activité/date du formulaire quand l'URL change
  // (clic sur un panel « Que souhaitez-vous réserver ? » → ?activity=…).
  useEffect(() => {
    if (validActivity) setActivitySlug(validActivity)
  }, [validActivity])

  useEffect(() => {
    if (presetDate) setDate(presetDate)
  }, [presetDate])

  // Date « aujourd'hui » posée après montage (évite l'écart SSR/CSR) — borne le calendrier.
  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10))
  }, [])

  // Descente FLUIDE vers le formulaire à chaque (re)sélection via l'URL (page
  // uniquement, jamais dans le popup). Petit délai : on laisse Next finir sa
  // navigation (sinon son saut instantané prend le dessus sur le scroll doux).
  useEffect(() => {
    if (variant !== 'page' || !validActivity) return
    const id = setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => clearTimeout(id)
  }, [variant, validActivity])

  // Charge les créneaux dès qu'une activité réservable + une date sont choisies.
  useEffect(() => {
    setSelectedTime('')
    setSlots([])
    if (!activitySlug || !date || !isBookable(activitySlug)) return

    let cancelled = false
    setLoadingSlots(true)
    fetch(`/api/availability?activity=${activitySlug}&date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setSlots(Array.isArray(data.slots) ? data.slots : [])
      })
      .catch(() => !cancelled && setSlots([]))
      .finally(() => !cancelled && setLoadingSlots(false))

    return () => {
      cancelled = true
    }
  }, [activitySlug, date])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return
    if (!selectedTime) {
      setErrorMsg(t('selectSlot'))
      setStatus('error')
      return
    }
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      activitySlug,
      date,
      time: selectedTime,
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      phoneCountry: String(fd.get('phoneCountry') || ''),
      notes: String(fd.get('notes') || ''),
      newsletterOptIn: fd.get('newsletterOptIn') === 'on',
      participants: participants
        .map((pp) => ({ name: pp.name.trim(), email: pp.email.trim(), phone: pp.phone.trim() }))
        .filter((pp) => pp.name && pp.email),
      locale,
    }
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'slot-unavailable') {
          // Créneau pris entre-temps : on rafraîchit la liste
          setErrorMsg(t('slotTaken'))
          setStatus('error')
          const refreshed = await fetch(`/api/availability?activity=${activitySlug}&date=${date}`).then((r) => r.json())
          setSlots(Array.isArray(refreshed.slots) ? refreshed.slots : [])
          setSelectedTime('')
          return
        }
        throw new Error(data.error || 'request-failed')
      }

      // Plus de paiement en ligne : la demande est enregistrée, on confirme par email.
      setStatus('request-received')
      setParticipants([])
      form.reset()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'error')
      setStatus('error')
    }
  }

  const inputCls =
    'h-11 rounded-xl bg-background/70 transition-shadow focus-visible:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)]'

  return (
    <div id="booking-form" className={variant === 'page' ? 'scroll-mt-24' : ''}>
      <div
        className={
          variant === 'dialog'
            ? 'p-6 sm:p-7'
            : 'rounded-2xl border border-border bg-card p-6 sm:p-8'
        }
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/15">
            <CalendarCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">{t('formTitle')}</h3>
            <p className="text-xs text-muted-foreground">{t('formSubtitle')}</p>
          </div>
        </div>

        {status === 'request-received' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-accent/[0.06] px-6 py-10 text-center ring-1 ring-accent/15"
          >
            {/* Halo orange pulsant + logo de marque */}
            <div className="relative flex size-24 items-center justify-center">
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-accent/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.55, 0, 0.55] }}
                transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-[6px] rounded-full bg-accent/15"
                animate={{ scale: [1, 1.22, 1], opacity: [0.8, 0.15, 0.8] }}
                transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 15, delay: 0.1 }}
                className="relative flex size-20 items-center justify-center rounded-full bg-white shadow-[0_14px_34px_-10px_oklch(0.63_0.187_47/0.55)] ring-1 ring-accent/20"
              >
                <Image
                  src="/logo.png"
                  alt="Shi Shi Samui"
                  width={754}
                  height={573}
                  className="size-12 object-contain"
                />
              </motion.span>
              <motion.span
                aria-hidden
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.5 }}
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-accent text-white ring-4 ring-card"
              >
                <Check className="size-4" aria-hidden />
              </motion.span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
            >
              <p className="font-display text-xl font-semibold text-foreground">{t('bookedTitle')}</p>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">{t('bookedText')}</p>
            </motion.div>
          </motion.div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="activitySlug">{t('fActivity')}</Label>
                <ActivitySelect
                  id="activitySlug"
                  value={activitySlug}
                  onChange={setActivitySlug}
                  locale={locale}
                  variant="field"
                  placeholder={t('fActivityPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('fDate')}</Label>
                <DatePopover
                  value={date}
                  today={today}
                  onChange={setDate}
                  locale={locale}
                  variant="field"
                  placeholder={t('fDate')}
                />
              </div>
            </div>

            {/* Tarif de l'activité sélectionnée */}
            {bookable && activitySlug && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-accent/[0.06] px-4 py-3 ring-1 ring-accent/15">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <Wallet className="size-4 text-accent" aria-hidden />
                  {fr ? 'Tarif' : 'Price'}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {fmtPrice(unitPrice)} ฿
                  <span className="font-normal text-muted-foreground">
                    {' / '}
                    {unitWord}
                    {perPerson ? (fr ? ' · par pers.' : ' · per person') : ''}
                  </span>
                </span>
              </div>
            )}

            {/* Activité non réservable en ligne (pickleball en travaux, restaurant…) :
                pas de créneaux — on oriente vers WhatsApp ou la page Contact. */}
            {activitySlug && !bookable && (
              <div className="rounded-2xl bg-secondary/50 px-5 py-6 text-center ring-1 ring-border">
                <p className="text-sm font-semibold text-foreground">{t('notBookableTitle')}</p>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{t('notBookableText')}</p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    <MessageCircle className="size-4" aria-hidden /> WhatsApp
                  </a>
                  <a
                    href={`/${locale}/contact-location`}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
                  >
                    <Mail className="size-4" aria-hidden /> {t('contactUs')}
                  </a>
                </div>
              </div>
            )}

            {/* Créneaux temps réel */}
            {bookable && activitySlug && date && (
              <div className="space-y-2.5">
                <Label>{dayPass ? t('fDayAccess') : t('fSlot')}</Label>
                <AnimatePresence mode="wait" initial={false}>
                  {loadingSlots ? (
                    <motion.p
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 py-2 text-sm text-muted-foreground"
                    >
                      <Loader2 className="size-4 animate-spin" aria-hidden /> {t('slotsLoading')}
                    </motion.p>
                  ) : !slots.some((s) => s.available > 0) ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/40 px-5 py-7 text-center"
                    >
                      <motion.span
                        animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
                        transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.6 }}
                        className="flex size-11 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/15"
                      >
                        <CalendarSearch className="size-5" aria-hidden />
                      </motion.span>
                      <p className="text-sm font-semibold text-foreground">{t('noSlotsTitle')}</p>
                      <p className="text-xs text-muted-foreground">{t('noSlotsHint')}</p>
                    </motion.div>
                  ) : dayPass ? (
                    <motion.div
                      key="day"
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {(() => {
                        const day = slots.find((s) => s.available > 0)
                        if (!day) return null
                        const selected = selectedTime === day.time
                        return (
                          <button
                            type="button"
                            onClick={() => setSelectedTime(day.time)}
                            className={[
                              'flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left transition-colors',
                              selected
                                ? 'border-accent bg-accent/10 ring-1 ring-accent/40'
                                : 'border-border bg-background hover:border-accent/50 hover:bg-accent/5',
                            ].join(' ')}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={[
                                  'flex size-9 items-center justify-center rounded-xl',
                                  selected
                                    ? 'bg-accent text-accent-foreground'
                                    : 'bg-accent/10 text-accent ring-1 ring-accent/15',
                                ].join(' ')}
                              >
                                <CalendarCheck className="size-4" aria-hidden />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-foreground">{t('dayAccessTitle')}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {day.available} {t('placesLeft')}
                                </span>
                              </span>
                            </span>
                            {selected && <Check className="size-5 text-accent" aria-hidden />}
                          </button>
                        )
                      })()}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="grid"
                      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.025 } } }}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-3 gap-2 sm:grid-cols-5"
                    >
                      {slots.map((s) => {
                        const full = s.available <= 0
                        const selected = selectedTime === s.time
                        return (
                          <motion.button
                            key={s.time}
                            variants={{
                              hidden: { opacity: 0, y: 6, scale: 0.94 },
                              show: { opacity: 1, y: 0, scale: 1 },
                            }}
                            whileHover={full ? undefined : { y: -2 }}
                            whileTap={full ? undefined : { scale: 0.94 }}
                            type="button"
                            disabled={full}
                            onClick={() => setSelectedTime(s.time)}
                            title={full ? t('slotFull') : `${s.available}/${s.capacity}`}
                            className={[
                              'h-10 rounded-lg border text-sm font-medium transition-colors',
                              full
                                ? 'cursor-not-allowed border-border bg-muted/40 text-muted-foreground/50 line-through'
                                : selected
                                  ? 'border-accent bg-accent text-accent-foreground shadow-[0_8px_20px_-8px_oklch(0.63_0.187_47/0.6)]'
                                  : 'border-border bg-background hover:border-accent/50 hover:bg-accent/5',
                            ].join(' ')}
                          >
                            {s.time}
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
                {!loadingSlots && !dayPass && slots.some((s) => s.available > 0) && (
                  <p className="text-xs text-muted-foreground">{t('slotHint')}</p>
                )}
              </div>
            )}

            {bookable && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('fName')}</Label>
                    <Input id="name" name="name" required autoComplete="name" className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('fEmail')}</Label>
                    <Input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('fPhone')} <span className="font-normal text-muted-foreground">({t('optional')})</span>
                  </Label>
                  <PhoneInput defaultIso2={DEFAULT_ISO2[locale]} />
                </div>

                {/* Réservation pour plusieurs personnes */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <Users className="size-4 text-accent" aria-hidden />
                      {fr ? 'Autres participants' : 'Other participants'}
                      <span className="font-normal text-muted-foreground">({t('optional')})</span>
                    </span>
                    <button
                      type="button"
                      onClick={addParticipant}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <Plus className="size-3.5" aria-hidden /> {fr ? 'Ajouter une personne' : 'Add a person'}
                    </button>
                  </div>

                  {participants.map((pp, i) => (
                    <div key={i} className="space-y-3 rounded-xl border border-border bg-background/50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {fr ? 'Personne' : 'Person'} {i + 2}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeParticipant(i)}
                          aria-label={fr ? 'Retirer' : 'Remove'}
                          className="text-muted-foreground transition-colors hover:text-red-600"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          required
                          placeholder={t('fName')}
                          autoComplete="off"
                          value={pp.name}
                          onChange={(e) => updateParticipant(i, 'name', e.target.value)}
                          className={inputCls}
                        />
                        <Input
                          required
                          type="email"
                          placeholder={t('fEmail')}
                          autoComplete="off"
                          value={pp.email}
                          onChange={(e) => updateParticipant(i, 'email', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <Input
                        type="tel"
                        placeholder={`${t('fPhone')} (${t('optional')})`}
                        autoComplete="off"
                        value={pp.phone}
                        onChange={(e) => updateParticipant(i, 'phone', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">
                    {t('fNotes')} <span className="font-normal text-muted-foreground">({t('optional')})</span>
                  </Label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background/70 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)] focus-visible:outline-none"
                  />
                </div>

                <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    name="newsletterOptIn"
                    className="mt-0.5 size-4 shrink-0 rounded border-input accent-accent"
                  />
                  <span>
                    {locale === 'fr'
                      ? 'Je souhaite recevoir les actualités et offres de Shi Shi Samui par email.'
                      : "I'd like to receive Shi Shi Samui news and offers by email."}
                  </span>
                </label>

                {/* Total indicatif (paiement sur place) */}
                {bookable && activitySlug && (
                  <div className="rounded-xl border border-accent/20 bg-accent/[0.04] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">
                        {fr ? 'Total indicatif' : 'Estimated total'} ·{' '}
                        {partySize} {fr ? (partySize > 1 ? 'personnes' : 'personne') : partySize > 1 ? 'people' : 'person'}
                      </span>
                      <span className="font-display text-lg font-bold text-foreground">{fmtPrice(total)} ฿</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {fr ? 'Paiement sur place, aucun paiement en ligne.' : 'Payment on site, no online payment.'}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === 'submitting' || !selectedTime}
                  className="w-full group bg-accent text-accent-foreground hover:bg-accent shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.5)]"
                >
                  {status === 'submitting' ? (
                    <>
                      {t('fSubmitting')}
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    </>
                  ) : (
                    t('fSubmit')
                  )}
                </Button>
              </>
            )}

            {status === 'error' && (
              <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-500/20">
                {errorMsg || t('formError')}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
