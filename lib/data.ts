// Demo data layer.
// Shaped to mirror the Drizzle/Neon schema in lib/db/schema.ts so swapping
// this module for real queries later is a drop-in change.

export type Dimension =
  | "stress"
  | "burnout"
  | "emotional"
  | "sleep"
  | "worklife"
  | "resilience";

export const dimensionLabels: Record<Dimension, string> = {
  stress: "Stress",
  burnout: "Burnout",
  emotional: "Emotional Wellbeing",
  sleep: "Sleep Quality",
  worklife: "Work-Life Balance",
  resilience: "Resilience",
};

export type Level = "Low" | "Medium" | "High";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  company: string;
  department: string;
  jobLevel: string;
  gender: string;
  age: number;
}

export const currentUser: CurrentUser = {
  id: "u_1042",
  name: "Andi Pratama",
  email: "andi.pratama@mindfulness.id",
  company: "Mindfulness Indonesia",
  department: "Finance",
  jobLevel: "Staff",
  gender: "Male",
  age: 29,
};

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  action: string;
  href: string;
}

// Real per-dimension recommendation copy. Which of these actually get shown
// is decided by getRecommendations() below, based on the user's *actual*
// latest assessment results — nothing here is displayed unconditionally.
const RECOMMENDATION_RULES: Record<
  Dimension,
  { title: string; reason: string; action: string; href: string }
> = {
  stress: {
    title: "Konseling dengan psikolog",
    reason: "Skor stress kamu tergolong tinggi minggu ini.",
    action: "Booking konseling",
    href: "/dashboard/counseling",
  },
  burnout: {
    title: "Konseling dengan psikolog",
    reason: "Indikator burnout kamu perlu perhatian lebih.",
    action: "Booking konseling",
    href: "/dashboard/counseling",
  },
  worklife: {
    title: "Webinar: Mengelola Beban Kerja",
    reason: "Berdasarkan pola work-life balance kamu.",
    action: "Lihat webinar",
    href: "/dashboard/webinar",
  },
  emotional: {
    title: "Mindfulness Practice — 10 menit",
    reason: "Membantu menstabilkan emotional wellbeing kamu.",
    action: "Mulai di Learning Center",
    href: "/dashboard/learning",
  },
  sleep: {
    title: "Mindfulness Practice — Relaksasi Tidur",
    reason: "Kualitas tidur kamu perlu ditingkatkan.",
    action: "Mulai di Learning Center",
    href: "/dashboard/learning",
  },
  resilience: {
    title: "Webinar: Membangun Resilience",
    reason: "Skor resilience kamu masih bisa ditingkatkan.",
    action: "Lihat webinar",
    href: "/dashboard/webinar",
  },
};

const FALLBACK_RECOMMENDATION: Recommendation = {
  id: "fallback-start-assessment",
  title: "Mulai assessment pertamamu",
  reason: "Isi assessment supaya rekomendasi bisa disesuaikan dengan kondisi kamu.",
  action: "Mulai assessment",
  href: "/dashboard/assessment",
};

// Builds a real, per-user recommendation list from actual assessment
// results (dimension + level), instead of a fixed list shown to everyone.
// - Dimensions scored "High" are prioritized, then "Medium".
// - Returns at most 3 cards; falls back to a prompt to take an assessment
//   when the user has no results yet.
export function getRecommendations(
  results: { dimension: Dimension; level: Level }[]
): Recommendation[] {
  if (!results.length) return [FALLBACK_RECOMMENDATION];

  const byPriority = [...results].sort((a, b) => {
    const rank = (l: Level) => (l === "High" ? 0 : l === "Medium" ? 1 : 2);
    return rank(a.level) - rank(b.level);
  });

  const picks: Recommendation[] = [];
  const usedHrefs = new Set<string>();
  for (const r of byPriority) {
    if (picks.length >= 3) break;
    if (r.level === "Low") continue; // nothing concerning to recommend for
    const rule = RECOMMENDATION_RULES[r.dimension];
    if (!rule || usedHrefs.has(rule.href)) continue;
    usedHrefs.add(rule.href);
    picks.push({ id: `rec-${r.dimension}`, ...rule });
  }

  return picks.length ? picks : [FALLBACK_RECOMMENDATION];
}

export interface LearningItem {
  id: string;
  type: "Video" | "Podcast" | "Article" | "Mindfulness Audio";
  title: string;
  duration: string;
}

// Static course catalog (content itself doesn't change per user — only
// *progress* through it does, which is tracked per-user in Firestore via
// lib/firestore/learning.ts, not here).
export const learningLibrary: LearningItem[] = [
  { id: "l1", type: "Mindfulness Audio", title: "Napas Sadar — 10 Menit", duration: "10 min" },
  { id: "l2", type: "Video", title: "Mengenali Tanda Burnout Sejak Dini", duration: "8 min" },
  { id: "l3", type: "Article", title: "5 Cara Menetapkan Batas Kerja yang Sehat", duration: "6 min" },
  { id: "l4", type: "Podcast", title: "Ngobrol Santai: Resilience di Tempat Kerja", duration: "22 min" },
  { id: "l5", type: "Mindfulness Audio", title: "Relaksasi Sebelum Tidur", duration: "12 min" },
];

export function levelColor(level: Level) {
  if (level === "High") return "text-danger bg-danger-soft";
  if (level === "Medium") return "text-warning bg-warning-soft";
  return "text-success bg-success-soft";
}
