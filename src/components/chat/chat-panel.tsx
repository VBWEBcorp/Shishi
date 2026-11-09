'use client'

import { Fragment, useEffect, useRef, useState } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

const TEXTES = {
  fr: {
    titre: 'Une question sur le club ?',
    sous: 'Réponse immédiate, ou on vous oriente vers WhatsApp.',
    accueil: 'Bonjour ! Tarifs, réservation, ce qui est inclus, Kids Club… Posez votre question, je vous réponds tout de suite.',
    suggestions: ['Les raquettes sont incluses ?', 'Et s’il pleut le jour du tennis ?', 'Le Kids Club, dès quel âge ?'],
    placeholder: 'Votre question…',
    envoyer: 'Envoyer',
    fermer: 'Fermer',
    erreur: 'Je n’arrive pas à répondre pour le moment. Écrivez-nous sur WhatsApp, on vous répond vite.',
    limite: 'Beaucoup de questions d’un coup : réessayez dans quelques minutes, ou écrivez-nous sur WhatsApp.',
  },
  en: {
    titre: 'A question about the club?',
    sous: 'Instant answer, or we point you to WhatsApp.',
    accueil: 'Hi! Prices, booking, what’s included, Kids Club… Ask away, I’ll answer right now.',
    suggestions: ['Are rackets included?', 'What if it rains on tennis day?', 'Kids Club: from what age?'],
    placeholder: 'Your question…',
    envoyer: 'Send',
    fermer: 'Close',
    erreur: 'I can’t answer right now. Message us on WhatsApp and we’ll get back to you quickly.',
    limite: 'Lots of questions at once: try again in a few minutes, or message us on WhatsApp.',
  },
}

/** Liens [texte](url) et adresses nues rendus cliquables, le reste en texte brut. */
function Texte({ contenu }: { contenu: string }) {
  const morceaux: React.ReactNode[] = []
  const motif = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s)]+[^\s).,;!?])/g
  let dernier = 0
  let m: RegExpExecArray | null
  let i = 0
  const propre = contenu.replace(/\*\*(.+?)\*\*/g, '$1')
  while ((m = motif.exec(propre))) {
    if (m.index > dernier) morceaux.push(<Fragment key={i++}>{propre.slice(dernier, m.index)}</Fragment>)
    const href = m[2] ?? m[3]
    const libelle = m[1] ?? href.replace(/^https?:\/\/(www\.)?/, '').replace(/^shi-shi-samui\.com/, '')
    const externe = !href.includes('shi-shi-samui.com')
    morceaux.push(
      <a
        key={i++}
        href={href}
        {...(externe ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="font-medium text-[#ea580c] underline underline-offset-2 break-words"
      >
        {/wa\.me/.test(href) && !m[1] ? 'WhatsApp' : libelle}
      </a>
    )
    dernier = m.index + m[0].length
  }
  if (dernier < propre.length) morceaux.push(<Fragment key={i++}>{propre.slice(dernier)}</Fragment>)
  return <>{morceaux}</>
}

export function ChatPanel({
  ouvert,
  fr,
  page,
  onFermer,
}: {
  ouvert: boolean
  fr: boolean
  page: string
  onFermer: () => void
}) {
  const t = fr ? TEXTES.fr : TEXTES.en
  const [messages, setMessages] = useState<Message[]>([])
  const [saisie, setSaisie] = useState('')
  const [enCours, setEnCours] = useState(false)
  const fil = useRef<HTMLDivElement>(null)
  const champ = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ouvert) champ.current?.focus({ preventScroll: true })
  }, [ouvert])

  useEffect(() => {
    fil.current?.scrollTo({ top: fil.current.scrollHeight })
  }, [messages])

  useEffect(() => {
    if (!ouvert) return
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && onFermer()
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [ouvert, onFermer])

  async function envoyer(question: string) {
    const texte = question.trim()
    if (!texte || enCours) return
    const historique: Message[] = [...messages, { role: 'user', content: texte }]
    setMessages([...historique, { role: 'assistant', content: '' }])
    setSaisie('')
    setEnCours(true)

    const ecrire = (contenu: string) =>
      setMessages((ms) => {
        const copie = ms.slice()
        copie[copie.length - 1] = { role: 'assistant', content: contenu }
        return copie
      })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Les réponses vides (échec précédent) ne repartent pas.
        body: JSON.stringify({
          messages: historique.filter((m) => m.content),
          locale: fr ? 'fr' : 'en',
          page,
        }),
      })
      if (!res.ok || !res.body) {
        ecrire(res.status === 429 ? t.limite : t.erreur)
        return
      }
      const lecteur = res.body.getReader()
      const decodeur = new TextDecoder()
      let reponse = ''
      for (;;) {
        const { done, value } = await lecteur.read()
        if (done) break
        reponse += decodeur.decode(value, { stream: true })
        ecrire(reponse)
      }
      if (!reponse) ecrire(t.erreur)
    } catch {
      ecrire(t.erreur)
    } finally {
      setEnCours(false)
    }
  }

  // z-[110] : ouvert à la demande du visiteur, le panneau passe devant la
  // bannière cookies (z-[100]) qui sinon cache la réponse sur mobile.
  return (
    <div
      role="dialog"
      aria-label={t.titre}
      aria-hidden={!ouvert}
      className={`fixed bottom-4 right-4 z-[110] flex max-h-[min(34rem,calc(100dvh-2rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none sm:bottom-6 sm:right-6 sm:w-[22rem] ${
        ouvert ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-black/5 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{t.titre}</p>
          <p className="text-xs text-muted-foreground">{t.sous}</p>
        </div>
        <button
          type="button"
          onClick={onFermer}
          aria-label={t.fermer}
          className="-mr-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
            <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div ref={fil} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
        <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary/70 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
          {t.accueil}
        </p>
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {t.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => envoyer(s)}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-black/10 transition-colors hover:bg-[#f97316]/10 hover:ring-[#f97316]/40"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <p
              key={i}
              className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#f97316] px-3.5 py-2.5 text-sm leading-relaxed text-white"
            >
              {m.content}
            </p>
          ) : (
            <p
              key={i}
              className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-secondary/70 px-3.5 py-2.5 text-sm leading-relaxed text-foreground"
            >
              {m.content ? (
                <Texte contenu={m.content} />
              ) : (
                <span className="inline-flex gap-1 py-1" aria-label={fr ? 'Réponse en cours' : 'Typing'}>
                  <span className="size-1.5 animate-pulse rounded-full bg-foreground/40" />
                  <span className="size-1.5 animate-pulse rounded-full bg-foreground/40 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-foreground/40 [animation-delay:300ms]" />
                </span>
              )}
            </p>
          )
        )}
      </div>

      <form
        className="flex items-end gap-2 border-t border-black/5 p-3"
        onSubmit={(e) => {
          e.preventDefault()
          envoyer(saisie)
        }}
      >
        <textarea
          ref={champ}
          value={saisie}
          onChange={(e) => setSaisie(e.target.value.slice(0, 800))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              envoyer(saisie)
            }
          }}
          rows={1}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          className="max-h-28 min-h-10 flex-1 resize-none rounded-xl bg-secondary/50 px-3 py-2 text-base leading-snug text-foreground outline-none ring-1 ring-black/5 placeholder:text-muted-foreground focus:ring-[#f97316]/50 sm:text-sm"
        />
        <button
          type="submit"
          disabled={enCours || !saisie.trim()}
          aria-label={t.envoyer}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f97316] text-white transition-opacity disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  )
}
