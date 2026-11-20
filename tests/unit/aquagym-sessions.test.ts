import { describe, expect, it } from 'vitest'

import { estJourAquagym, prochainesSeances, seanceOuverte } from '@/lib/aquagym-sessions'

describe('séances d’aquagym (lundi et vendredi 9 h, Bangkok)', () => {
  it('ne garde que les lundis et vendredis', () => {
    expect(estJourAquagym('2026-11-23')).toBe(true) // lundi
    expect(estJourAquagym('2026-11-27')).toBe(true) // vendredi
    expect(estJourAquagym('2026-11-24')).toBe(false) // mardi
  })

  it('liste quatre semaines de séances à venir', () => {
    // Vendredi 20/11/2026, 8 h à Bangkok : la séance de 9 h est encore ouverte.
    const now = new Date('2026-11-20T08:00:00+07:00').getTime()
    const s = prochainesSeances(now)
    expect(s[0]).toBe('2026-11-20')
    expect(s[1]).toBe('2026-11-23')
    expect(s).toHaveLength(8)
  })

  it('ferme une séance dès son début', () => {
    const now = new Date('2026-11-20T09:00:00+07:00').getTime()
    expect(seanceOuverte('2026-11-20', now)).toBe(false)
    expect(seanceOuverte('2026-11-23', now)).toBe(true)
    expect(seanceOuverte('2026-11-24', now)).toBe(false)
  })
})
