'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { SectionTitle } from '@/components/ui/section-title'
import { useContent } from '@/hooks/use-content'
import { faqContent } from '@/lib/site-content'

const ease = [0.22, 1, 0.36, 1] as const

const defaults = { faq: faqContent }

interface FaqItem {
  question: string
  answer: string
}

function FaqAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
  reduceMotion,
}: {
  item: FaqItem
  index: number
  isOpen: boolean
  onToggle: () => void
  reduceMotion: boolean | null
}) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: reduceMotion ? 0 : 24,
          x: reduceMotion ? 0 : -16,
        },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: { duration: 0.5, ease },
        },
      }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors duration-300 hover:border-primary/30">
        {/* Bordure dégradée subtile */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl p-px opacity-0 transition-opacity duration-300"
          aria-hidden
          style={{
            background:
              'linear-gradient(135deg, oklch(0.55 0.2 285 / 0.35) 0%, oklch(0.91 0.012 264 / 0.5) 50%, oklch(0.55 0.2 285 / 0.35) 100%)',
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: isOpen ? 1 : 0,
          }}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="relative flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.02] sm:px-6 sm:py-5"
        >
          <span className="flex items-baseline gap-3 font-display text-[15px] font-semibold tracking-tight text-foreground sm:text-base">
            <span className="font-display text-xs font-semibold tracking-[0.2em] text-primary/70">
              0{index + 1}
            </span>
            {item.question}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease }}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20"
            aria-hidden
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6">
                <div className="border-t border-border/50 pt-4">
                  {item.answer}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export function FaqSection() {
  const { data } = useContent('home', { faq: defaults.faq })
  const faq = data.faq ?? defaults.faq
  const items: FaqItem[] = faq.items ?? defaults.faq.items
  const reduceMotion = useReducedMotion()

  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="border-b border-border/60 bg-[oklch(0.975_0.012_285)] dark:bg-[oklch(0.16_0.02_285)]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionTitle
          eyebrow={faq.eyebrow}
          title={faq.title}
          description={faq.description}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
          }}
          className="mx-auto mt-14 max-w-3xl space-y-3"
        >
          {items.map((item, i) => (
            <FaqAccordionItem
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="mx-auto mt-12 flex max-w-2xl flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-4"
        >
          <p className="text-sm text-muted-foreground">
            Vous ne trouvez pas votre réponse ?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Contactez-nous directement
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
