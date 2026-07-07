import { describe, it, expect } from 'vitest'
import { visiblePostFilter } from '@/lib/blog-filters'

describe('visiblePostFilter', () => {
  it('ne remonte que les articles publiés', () => {
    expect(visiblePostFilter().published).toBe(true)
  })

  it('exclut les articles programmés dans le futur (publishedAt <= maintenant)', () => {
    const filter = visiblePostFilter()
    expect(filter.publishedAt.$lte).toBeInstanceOf(Date)
    expect(filter.publishedAt.$lte.getTime()).toBeLessThanOrEqual(Date.now())
  })
})
