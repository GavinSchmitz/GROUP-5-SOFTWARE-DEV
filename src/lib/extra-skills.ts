import type { SkillDetailResponse, SkillEntry } from "@/types/api";

export const EXTRA_CATEGORY = "Communication & Leadership";

export const hiddenSkillSlugs = new Set(["public-speaking"]);

export const extraSkills: SkillEntry[] = [
  {
    id: 9002,
    name: "Leadership & Mentoring",
    slug: "leadership-and-mentoring",
    category: EXTRA_CATEGORY,
    description:
      "People management, team coaching and mentorship for early-career professionals.",
    icon: "megaphone",
    _count: { userSkills: 0 },
  },
];

export function mergeCategories(categories: string[]): string[] {
  return categories.includes(EXTRA_CATEGORY)
    ? categories
    : [...categories, EXTRA_CATEGORY];
}

export function filterExtraSkills(opts: {
  q?: string;
  category?: string;
}): SkillEntry[] {
  const query = (opts.q ?? "").trim().toLowerCase();
  return extraSkills.filter((skill) => {
    if (opts.category && skill.category !== opts.category) return false;
    if (
      query &&
      !(
        skill.name.toLowerCase().includes(query) ||
        (skill.description ?? "").toLowerCase().includes(query)
      )
    ) {
      return false;
    }
    return true;
  });
}

export function hideHiddenSkills(skills: SkillEntry[]): SkillEntry[] {
  return skills.filter((skill) => !hiddenSkillSlugs.has(skill.slug));
}

export function findExtraSkillBySlug(
  slug: string
): SkillEntry | undefined {
  return extraSkills.find((skill) => skill.slug === slug);
}

export function extraSkillDetail(skill: SkillEntry): SkillDetailResponse {
  return {
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    category: skill.category,
    description: skill.description,
    icon: skill.icon,
    userSkills: [],
  };
}
