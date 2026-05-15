/**
 * Résout une icône lucide-react par son nom (chaîne).
 * Permet à site-content.ts de référencer les icônes par string ("Globe",
 * "Phone"...) sans imposer d'imports React au fichier de config.
 *
 * Liste complète : https://lucide.dev/icons/
 */

import {
  BarChart3,
  Briefcase,
  Code,
  FileText,
  Globe,
  Hammer,
  Heart,
  HelpCircle,
  Home,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  Palette,
  Paintbrush,
  Phone,
  Scale,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Users,
  Utensils,
  Wine,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  Briefcase,
  Code,
  FileText,
  Globe,
  Hammer,
  Heart,
  Home,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  Palette,
  Paintbrush,
  Phone,
  Scale,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Users,
  Utensils,
  Wine,
  Wrench,
}

export function getIcon(name?: string): LucideIcon {
  if (!name) return HelpCircle
  return iconMap[name] ?? HelpCircle
}

export type IconName = keyof typeof iconMap
