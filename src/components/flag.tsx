import { cn } from '@/lib/utils'

/**
 * Drapeau d'un pays sous forme d'image (et non d'emoji) : les emoji 🇫🇷 ne sont
 * pas rendus sous Windows (affichés « FR »). On utilise les SVG de flagcdn.
 */
export function Flag({ iso2, className }: { iso2?: string; className?: string }) {
  if (!iso2) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${iso2.toLowerCase()}.svg`}
      alt=""
      width={20}
      height={14}
      loading="lazy"
      className={cn('inline-block h-[14px] w-[20px] shrink-0 rounded-[2px] object-cover ring-1 ring-black/10', className)}
    />
  )
}
