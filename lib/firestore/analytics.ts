import { auth } from "@/lib/firebase/config";
import type { Level } from "@/lib/data";

export interface PlatformStats {
  totalUsers: number;
  totalEmployees: number;
  totalAssessmentsCompleted: number;
  assessmentCompletionRate: number; // % of employees with at least 1 result
  stressDistribution: { high: number; medium: number; low: number };
  totalWebinars: number;
  totalWebinarRegistrations: number;
  departmentBreakdown: { department: string; count: number }[];
  // Whole-platform only (not meaningful when scoped to a single company).
  totalCompanies: number;
  totalPsychologists: number;
  totalCounselingSessions: number;
}

function emptyStats(): PlatformStats {
  return {
    totalUsers: 0,
    totalEmployees: 0,
    totalAssessmentsCompleted: 0,
    assessmentCompletionRate: 0,
    stressDistribution: { high: 0, medium: 0, low: 0 },
    totalWebinars: 0,
    totalWebinarRegistrations: 0,
    departmentBreakdown: [],
    totalCompanies: 0,
    totalPsychologists: 0,
    totalCounselingSessions: 0,
  };
}

// SECURITY NOTE: this used to query Firestore directly from the browser
// (assessmentResults / counselingBookings / users), which technically let
// any HR/AdMedika account read individual employees' raw records via the
// SDK, not just aggregates (Firestore rules can't tell "reading to compute
// an aggregate" apart from "reading one specific record"). Fixed by moving
// the aggregation server-side into /api/stats (Vercel serverless function,
// using the Firebase Admin SDK — no Cloud Functions / Blaze plan needed).
// The API route re-derives the caller's role + company from their verified
// ID token, so a client can never widen its own scope, and the Firestore
// rules for those collections no longer grant HR/AdMedika raw read access
// at all — this function (and the endpoint behind it) is now the only way
// those roles ever see this data.
//
// The `company` param is kept for call-site compatibility (see app/hr,
// app/admedika, app/admin, app/super-admin) but is otherwise unused now —
// the server decides scope from the caller's own profile, not from
// whatever the client passes in.
export async function getPlatformStats(_company?: string): Promise<PlatformStats> {
  if (!auth?.currentUser) return emptyStats();
  try {
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch("/api/stats", { headers: { Authorization: `Bearer ${idToken}` } });
    if (!res.ok) return emptyStats();
    const json = await res.json();
    return (json.stats as PlatformStats) ?? emptyStats();
  } catch {
    return emptyStats();
  }
}

export interface RecentAssessment {
  id: string;
  userName: string;
  title: string;
  level: Level;
  createdAt?: unknown;
}

// Most recent assessment submissions across all employees, for the
// "recent activity" style feeds on admin dashboards. See security note on
// getPlatformStats above — this also now goes through /api/stats.
export async function getRecentAssessments(max = 5): Promise<RecentAssessment[]> {
  if (!auth?.currentUser) return [];
  try {
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch(`/api/stats?include=recent&max=${max}`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.recentAssessments as RecentAssessment[]) ?? [];
  } catch {
    return [];
  }
}
