import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * N'autorise qu'un lien de schéma sûr (http/https/mailto/tel, ancre ou chemin
 * relatif). Neutralise `javascript:` et `data:` — un lien piégé saisi dans le
 * back-office (popup/bannière marketing) ne peut plus exécuter de script au clic.
 * Retourne `#` par défaut.
 */
export function safeUrl(url?: string | null): string {
  if (!url) return '#'
  const trimmed = url.trim()
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed
  return '#'
}
