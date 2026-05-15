'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('mymag-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      type="button"
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full text-muted-foreground/40 transition-all duration-300 hover:text-foreground hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className
      )}
      aria-label={dark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      aria-pressed={dark}
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <Sun className="size-[13px]" strokeWidth={1.5} /> : <Moon className="size-[13px]" strokeWidth={1.5} />}
    </button>
  )
}
