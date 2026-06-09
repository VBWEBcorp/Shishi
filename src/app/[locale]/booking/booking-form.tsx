'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck, CheckCircle2, Loader2, MessageCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { isBookable } from '@/lib/availability'
import { siteConfig } from '@/lib/seo'

type Status = 'idle' | 'submitting' | 'request-received' | 'error'

interface Slot {
  time: string
  available: number
  capacity: number
}

const waMessage = encodeURIComponent("Hi Shi Shi Samui! I'd like to book a session.")
const waLink = `https://wa.me/${siteConfig.whatsapp}?text=${waMessage}`

export function BookingForm() {
  const t = useTranslations('Booking')
  const locale = useLocale() as Locale
  const params = useSearchParams()
  const paymentStatus = params.get('status') // success | cancelled

  const [activitySlug, setActivitySlug] = useState('')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')

  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const bookable = activitySlug ? isBookable(activitySlug) : true

  useEffect(() => {
    if (paymentStatus) {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [paymentStatus])

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
      notes: String(fd.get('notes') || ''),
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

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      setStatus('request-received')
      form.reset()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'error')
      setStatus('error')
    }
  }

  const inputCls =
    'h-11 rounded-xl bg-background/70 transition-shadow focus-visible:shadow-[0_0_0_4px_oklch(0.55_0.2_285/0.1)]'

  return (
    <div id="booking-form" className="scroll-mt-24">
      {paymentStatus === 'success' && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-500/10 px-5 py-4 text-emerald-700 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          <p className="text-sm font-medium">{t('paidConfirmed')}</p>
        </div>
      )}
      {paymentStatus === 'cancelled' && (
        <div className="mb-6 rounded-2xl bg-amber-500/10 px-5 py-4 text-sm font-medium text-amber-700 ring-1 ring-amber-500/20">
          {t('paymentCancelled')}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <CalendarCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">{t('formTitle')}</h3>
            <p className="text-xs text-muted-foreground">{t('formSubtitle')}</p>
          </div>
        </div>

        {status === 'request-received' ? (
          <div className="mt-6 rounded-xl bg-emerald-500/10 px-5 py-6 text-center ring-1 ring-emerald-500/20">
            <CheckCircle2 className="mx-auto size-8 text-emerald-600" aria-hidden />
            <p className="mt-3 text-sm font-medium text-emerald-800">{t('requestReceived')}</p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white"
            >
              <MessageCircle className="size-4" aria-hidden />
              {t('bookOnWhatsapp')}
            </a>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="activitySlug">{t('fActivity')}</Label>
                <select
                  id="activitySlug"
                  name="activitySlug"
                  required
                  value={activitySlug}
                  onChange={(e) => setActivitySlug(e.target.value)}
                  className={`${inputCls} w-full border border-input px-3 text-sm`}
                >
                  <option value="" disabled>
                    {t('fActivityPlaceholder')}
                  </option>
                  {activities.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.name[locale]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">{t('fDate')}</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Activité non réservable en ligne (ex: restaurant) */}
            {activitySlug && !bookable && (
              <div className="rounded-xl bg-secondary/60 px-4 py-4 text-sm text-muted-foreground ring-1 ring-border">
                {t('notBookableOnline')}{' '}
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">
                  WhatsApp
                </a>
                .
              </div>
            )}

            {/* Créneaux temps réel */}
            {bookable && activitySlug && date && (
              <div className="space-y-2">
                <Label>{t('fSlot')}</Label>
                {loadingSlots ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden /> {t('slotsLoading')}
                  </p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('noSlots')}</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {slots.map((s) => {
                      const full = s.available <= 0
                      const selected = selectedTime === s.time
                      return (
                        <button
                          key={s.time}
                          type="button"
                          disabled={full}
                          onClick={() => setSelectedTime(s.time)}
                          title={full ? t('slotFull') : `${s.available}/${s.capacity}`}
                          className={[
                            'h-10 rounded-lg border text-sm font-medium transition-colors',
                            full
                              ? 'cursor-not-allowed border-border bg-muted/40 text-muted-foreground/50 line-through'
                              : selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5',
                          ].join(' ')}
                        >
                          {s.time}
                        </button>
                      )
                    })}
                  </div>
                )}
                {!loadingSlots && slots.length > 0 && (
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
                  <Label htmlFor="phone">
                    {t('fPhone')} <span className="font-normal text-muted-foreground">({t('optional')})</span>
                  </Label>
                  <Input id="phone" name="phone" type="tel" autoComplete="tel" className={inputCls} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">
                    {t('fNotes')} <span className="font-normal text-muted-foreground">({t('optional')})</span>
                  </Label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background/70 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-[0_0_0_4px_oklch(0.55_0.2_285/0.1)] focus-visible:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === 'submitting' || !selectedTime}
                  className="w-full group"
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
