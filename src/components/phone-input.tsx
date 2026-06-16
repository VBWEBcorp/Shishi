'use client'

import { useState } from 'react'

import { Flag } from '@/components/flag'
import { COUNTRIES, COUNTRY_BY_ISO2 } from '@/lib/country-codes'
import { cn } from '@/lib/utils'

/** Indicatifs partagés par plusieurs pays → pays affiché par défaut. */
const SHARED_DIAL_DEFAULT: Record<string, string> = { '+1': 'US', '+7': 'RU' }

/**
 * Détecte le pays à partir de l'indicatif tapé (« +33… » → FR). On teste le
 * préfixe le plus long d'abord (4 → 1 chiffres) pour lever les ambiguïtés.
 */
function detectIso2(value: string): string | null {
  const cleaned = value.replace(/[^\d+]/g, '')
  if (!cleaned.startsWith('+')) return null
  const num = cleaned.slice(1)
  if (!num) return null
  for (let len = 4; len >= 1; len--) {
    const prefix = num.slice(0, len)
    if (prefix.length < len) continue
    const matches = COUNTRIES.filter((c) => c.dial.slice(1) === prefix)
    if (matches.length === 0) continue
    if (matches.length === 1) return matches[0].iso2
    return SHARED_DIAL_DEFAULT['+' + prefix] ?? matches[0].iso2
  }
  return null
}

/**
 * Saisie de téléphone international en un seul champ, sans menu déroulant :
 *  · on tape l'indicatif (« +33… ») → le pays est détecté et le drapeau s'affiche ;
 *  · on tape un numéro LOCAL (commençant par 0) → converti aussitôt avec
 *    l'indicatif du pays par défaut de la langue (« 06… » → « +33 6… »).
 *
 * Expose via FormData :
 *  · `name`           → numéro complet international (« +33 627301788 »)
 *  · `${name}Country` → code ISO2 détecté (FR, TH…)
 */
export function PhoneInput({
  name = 'phone',
  defaultIso2 = 'TH',
}: {
  name?: string
  defaultIso2?: string
}) {
  const [value, setValue] = useState('')

  // Pays affiché : détecté depuis le « + », sinon le pays par défaut (numéro local).
  const iso2 = (value.startsWith('+') ? detectIso2(value) : null) ?? defaultIso2
  // Exemple générique adapté au pays courant (jamais un vrai numéro) : montre
  // l'indicatif et le format international, pratique quel que soit le pays.
  const dial = COUNTRY_BY_ISO2[iso2]?.dial ?? '+'

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value
    const t = v.replace(/^\s+/, '')
    // Numéro local commençant par 0 → on remplace le 0 par l'indicatif du pays
    // par défaut, immédiatement (« 0627… » → « +33 627… »).
    if (t.startsWith('0')) {
      const dial = COUNTRY_BY_ISO2[defaultIso2]?.dial ?? '+'
      v = `${dial} ${t.slice(1)}`
    }
    setValue(v)
  }

  return (
    <div className="flex h-11 items-center gap-2 rounded-xl border border-input bg-background/70 pl-3 pr-3.5 transition-shadow focus-within:shadow-[0_0_0_4px_oklch(0.63_0.187_47/0.12)]">
      <Flag iso2={iso2} />
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onChange={onChange}
        placeholder={`${dial} 612 345 678`}
        aria-label="Numéro de téléphone"
        className={cn('h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground')}
      />
      {/* Valeurs récupérées par FormData */}
      <input type="hidden" name={name} value={value.trim()} />
      <input type="hidden" name={`${name}Country`} value={iso2} />
    </div>
  )
}
