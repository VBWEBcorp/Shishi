'use client'

import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'

/**
 * Bloc de texte replié, avec un bouton « Lire la suite ».
 *
 * POINT IMPORTANT POUR LE RÉFÉRENCEMENT : le texte est TOUJOURS dans le HTML envoyé au
 * navigateur et aux moteurs. Il n'est ni chargé au clic, ni masqué par `display: none` — il est
 * simplement rogné en hauteur par CSS, avec un dégradé qui annonce la suite. Google lit donc
 * l'intégralité du contenu, alors qu'un « lire plus » qui va chercher son texte au clic ne lui
 * montre rien du tout.
 *
 * C'est ce qui permet de répondre à la demande — une page riche mais qui n'a pas l'air d'un mur
 * de texte optimisé — sans sacrifier ce que la page dit aux moteurs.
 */
export function ReadMore({
  children,
  labelMore,
  labelLess,
  collapsedHeight = 190,
}: {
  children: React.ReactNode
  labelMore: string
  labelLess: string
  /** Hauteur visible tant que le bloc est replié, en pixels. */
  collapsedHeight?: number
}) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div>
      <div
        id={id}
        className="relative overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ maxHeight: open ? '6000px' : `${collapsedHeight}px` }}
      >
        {children}

        {/* Dégradé de fin : dit qu'il y a une suite, sans barre de séparation. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/85 to-transparent transition-opacity duration-300 ${
            open ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="group mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:text-accent"
      >
        {open ? labelLess : labelMore}
        <ChevronDown
          aria-hidden
          className={`size-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  )
}
