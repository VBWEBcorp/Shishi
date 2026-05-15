'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { AmbientShapes } from '@/components/ui/ambient-shapes'
import { useContent } from '@/hooks/use-content'

const ease = [0.22, 1, 0.36, 1] as const

const defaults = {
  eyebrow: 'Notre histoire',
  title: 'Une approche humaine, des résultats concrets',
  paragraph1: 'Depuis nos débuts, nous croyons qu\'un bon site commence par une bonne écoute. Nous prenons le temps de comprendre votre métier, vos clients et vos objectifs avant de concevoir quoi que ce soit.',
  paragraph2: 'Le résultat : des projets qui vous ressemblent, qui parlent à votre audience, et qui travaillent pour vous 24h/24.',
  image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
}

export function StorySection() {
  const { data } = useContent('home', { story: defaults })
  const story = data.story ?? defaults

  return (
    <section className="relative isolate overflow-hidden border-b border-border/60 bg-background">
      <AmbientShapes variant="light-accent" />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="max-w-xl"
          >
            <span className="inline-block font-mono text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {story.eyebrow}
            </span>

            <h2 className="mt-5 font-display text-balance text-[32px] leading-[1.08] tracking-[-0.02em] text-foreground sm:text-[40px] lg:text-[48px]">
              {story.title}
            </h2>

            <div className="mt-7 space-y-5">
              <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                {story.paragraph1}
              </p>
              <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                {story.paragraph2}
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/a-propos"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <span className="border-b border-foreground/60 pb-0.5 transition-colors duration-300 group-hover:border-foreground">
                  Lire notre histoire
                </span>
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
            className="relative"
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4, ease }}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] ring-1 ring-foreground/5"
            >
              <Image
                src={story.image}
                alt=""
                fill
                sizes="(min-width:768px) 45vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
