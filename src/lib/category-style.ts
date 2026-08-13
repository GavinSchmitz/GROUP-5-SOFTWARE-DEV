import {
  Coffee,
  Dumbbell,
  GraduationCap,
  Heart,
  Megaphone,
  Monitor,
  Music,
  Palette,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface CategoryStyle {
  icon: LucideIcon;
  gradient: string;
  bg: string;
  text: string;
  border: string;
  chip: string;
  shadow: string;
}

const fallback: CategoryStyle = {
  icon: GraduationCap,
  gradient: "from-amber-500 to-orange-600",
  bg: "bg-amber-50",
  text: "text-amber-700",
  border: "border-amber-200",
  chip: "bg-amber-500 hover:bg-amber-600",
  shadow: "hover:shadow-amber-200/60",
};

export const categoryStyles: Record<string, CategoryStyle> = {
  Education: {
    icon: GraduationCap,
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    chip: "bg-blue-600 hover:bg-blue-700",
    shadow: "hover:shadow-blue-200/60",
  },
  "DIY & Trades": {
    icon: Wrench,
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    chip: "bg-emerald-600 hover:bg-emerald-700",
    shadow: "hover:shadow-emerald-200/60",
  },
  Technology: {
    icon: Monitor,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    chip: "bg-violet-600 hover:bg-violet-700",
    shadow: "hover:shadow-violet-200/60",
  },
  Creative: {
    icon: Palette,
    gradient: "from-pink-500 to-rose-600",
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    chip: "bg-pink-600 hover:bg-pink-700",
    shadow: "hover:shadow-pink-200/60",
  },
  Music: {
    icon: Music,
    gradient: "from-amber-500 to-yellow-600",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    chip: "bg-amber-500 hover:bg-amber-600",
    shadow: "hover:shadow-amber-200/60",
  },
  Fitness: {
    icon: Dumbbell,
    gradient: "from-orange-500 to-red-600",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    chip: "bg-orange-600 hover:bg-orange-700",
    shadow: "hover:shadow-orange-200/60",
  },
  Wellness: {
    icon: Heart,
    gradient: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    chip: "bg-teal-600 hover:bg-teal-700",
    shadow: "hover:shadow-teal-200/60",
  },
  Lifestyle: {
    icon: Coffee,
    gradient: "from-stone-500 to-amber-700",
    bg: "bg-stone-50",
    text: "text-stone-700",
    border: "border-stone-200",
    chip: "bg-stone-600 hover:bg-stone-700",
    shadow: "hover:shadow-stone-200/60",
  },
  "Communication & Leadership": {
    icon: Megaphone,
    gradient: "from-fuchsia-500 to-purple-600",
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
    chip: "bg-fuchsia-600 hover:bg-fuchsia-700",
    shadow: "hover:shadow-fuchsia-200/60",
  },
};

export function getCategoryStyle(category: string): CategoryStyle {
  return categoryStyles[category] ?? fallback;
}
