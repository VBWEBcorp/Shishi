'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

/*
 * Bulle « Une question ? » de l'assistant, posée juste au-dessus du bouton
 * WhatsApp (une simple icône sur mobile, comme WhatsApp). Discrète et légère : la bulle seule pèse quelques lignes, le
 * panneau n'est chargé qu'au premier clic. Rien ne s'anime au chargement.
 */
const ChatPanel = dynamic(() => import('./chat-panel').then((m) => m.ChatPanel), { ssr: false })

export function ChatLauncher() {
  const pathname = usePathname()
  const fr = pathname?.startsWith('/fr') ?? false
  const [ouvert, setOuvert] = useState(false)
  const [charge, setCharge] = useState(false)

  return (
    <>
      {!ouvert && (
        <button
          type="button"
          onClick={() => {
            setCharge(true)
            setOuvert(true)
          }}
          aria-label={fr ? 'Poser une question au club' : 'Ask the club a question'}
          className="fixed bottom-[4.75rem] right-6 z-50 flex size-11 items-center justify-center gap-2 rounded-full bg-white/95 sm:w-auto sm:pl-3 sm:pr-4 text-sm font-medium text-foreground shadow-lg ring-1 ring-black/10 backdrop-blur-sm transition-transform duration-200 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 text-[#f97316]" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-4-.84L3 20l1.4-3.73A7.6 7.6 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
          </svg>
          <span className="hidden sm:inline">{fr ? 'Une question ?' : 'Questions?'}</span>
        </button>
      )}
      {charge && <ChatPanel ouvert={ouvert} fr={fr} page={pathname ?? ''} onFermer={() => setOuvert(false)} />}
    </>
  )
}
