import {
  Apple,
  BookOpen,
  Brain,
  Droplets,
  Dumbbell,
  Footprints,
  GlassWater,
  Heart,
  Leaf,
  Moon,
  PenLine,
  Pill,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react";

/** Curated set of icons users can pick for a habit. */
export const HABIT_ICONS: Record<string, LucideIcon> = {
  target: Target,
  water: GlassWater,
  droplets: Droplets,
  dumbbell: Dumbbell,
  run: Footprints,
  apple: Apple,
  book: BookOpen,
  brain: Brain,
  heart: Heart,
  leaf: Leaf,
  moon: Moon,
  sun: Sun,
  pen: PenLine,
  pill: Pill,
};

export const HABIT_ICON_KEYS = Object.keys(HABIT_ICONS);

export function habitIcon(name: string | null | undefined): LucideIcon {
  return (name && HABIT_ICONS[name]) || Target;
}
