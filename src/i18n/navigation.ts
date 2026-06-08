import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

// Wrappers locale-aware : à utiliser à la place de next/link et next/navigation
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
