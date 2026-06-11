import { cn } from '@/lib/utils'

/**
 * « Rebord » blanc aux angles arrondis qui remonte en bas d'un hero plein cadre :
 * le bloc de contenu suivant (fond `background`) semble chevaucher l'image du hero
 * avec de grands angles arrondis. À poser en dernier enfant d'une `<section relative>`.
 *
 * La hauteur est ≥ au rayon pour que les angles soient pleinement dessinés.
 */
export function HeroCurve({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'absolute inset-x-0 bottom-0 z-10 h-8 rounded-t-[1.5rem] bg-background sm:rounded-t-[1.75rem]',
        className
      )}
    />
  )
}
