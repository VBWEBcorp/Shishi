import { cn } from '@/lib/utils'

type SectionTitleProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        'mx-auto max-w-2xl space-y-4',
        align === 'center' && 'text-center',
        className
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-balance text-3xl leading-[1.12] tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.6rem]">
        {title}
      </h2>
      {description ? (
        <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  )
}
