import {
  Baby,
  Beer,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  Clapperboard,
  Coffee,
  Coins,
  Dumbbell,
  Ellipsis,
  FileText,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HandCoins,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  Music,
  PawPrint,
  PiggyBank,
  Pill,
  Plane,
  Receipt,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/**
 * Category icons are stored as stable keys (e.g. "utensils") and rendered with Lucide line icons
 * so they match the UI. Older rows stored emoji — LEGACY_EMOJI maps those to keys.
 */
export const CATEGORY_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  utensils: { icon: Utensils, label: 'Food' },
  coffee: { icon: Coffee, label: 'Coffee' },
  'shopping-cart': { icon: ShoppingCart, label: 'Groceries' },
  beer: { icon: Beer, label: 'Drinks' },
  bus: { icon: Bus, label: 'Transit' },
  car: { icon: Car, label: 'Car' },
  fuel: { icon: Fuel, label: 'Fuel' },
  plane: { icon: Plane, label: 'Travel' },
  'shopping-bag': { icon: ShoppingBag, label: 'Shopping' },
  shirt: { icon: Shirt, label: 'Clothes' },
  gift: { icon: Gift, label: 'Gifts' },
  film: { icon: Clapperboard, label: 'Entertainment' },
  gamepad: { icon: Gamepad2, label: 'Games' },
  music: { icon: Music, label: 'Music' },
  receipt: { icon: Receipt, label: 'Bills' },
  home: { icon: House, label: 'Home' },
  zap: { icon: Zap, label: 'Utilities' },
  wifi: { icon: Wifi, label: 'Internet' },
  phone: { icon: Smartphone, label: 'Phone' },
  health: { icon: HeartPulse, label: 'Health' },
  pill: { icon: Pill, label: 'Pharmacy' },
  gym: { icon: Dumbbell, label: 'Fitness' },
  education: { icon: GraduationCap, label: 'Education' },
  book: { icon: BookOpen, label: 'Books' },
  baby: { icon: Baby, label: 'Kids' },
  pet: { icon: PawPrint, label: 'Pets' },
  document: { icon: FileText, label: 'Documents' },
  wallet: { icon: Wallet, label: 'Wallet' },
  briefcase: { icon: Briefcase, label: 'Salary' },
  laptop: { icon: Laptop, label: 'Freelance' },
  'hand-coins': { icon: HandCoins, label: 'Refunds' },
  bank: { icon: Landmark, label: 'Bank' },
  'piggy-bank': { icon: PiggyBank, label: 'Savings' },
  invest: { icon: TrendingUp, label: 'Investments' },
  coins: { icon: Coins, label: 'Cash' },
  sparkles: { icon: Sparkles, label: 'Other' },
  other: { icon: Ellipsis, label: 'Other' },
}

export const ICON_KEYS = Object.keys(CATEGORY_ICONS)

const LEGACY_EMOJI: Record<string, string> = {
  '🍔': 'utensils',
  '🚌': 'bus',
  '🛍️': 'shopping-bag',
  '🛍': 'shopping-bag',
  '🎬': 'film',
  '📄': 'receipt',
  '💊': 'pill',
  '💰': 'wallet',
  '🏠': 'home',
  '✈️': 'plane',
  '✈': 'plane',
  '📱': 'phone',
  '🎮': 'gamepad',
  '☕': 'coffee',
  '🛒': 'shopping-cart',
  '🏋️': 'gym',
  '🏋': 'gym',
  '📚': 'book',
  '🎁': 'gift',
  '💼': 'briefcase',
  '💻': 'laptop',
  '🐶': 'pet',
  '👶': 'baby',
  '🎓': 'education',
  '⛽': 'fuel',
  '🍺': 'beer',
  '💡': 'zap',
  $: 'wallet',
}

/** Normalise a stored icon (key or legacy emoji) to a registry key. */
export function resolveCategoryKey(icon: string | null | undefined): string {
  if (!icon) return 'other'
  if (CATEGORY_ICONS[icon]) return icon
  const key = LEGACY_EMOJI[icon] ?? LEGACY_EMOJI[icon.replace(/️/g, '')]
  return key && CATEGORY_ICONS[key] ? key : 'other'
}

export function resolveCategoryIcon(icon: string | null | undefined): LucideIcon {
  return CATEGORY_ICONS[resolveCategoryKey(icon)].icon
}
