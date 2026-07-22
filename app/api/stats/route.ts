import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth, isAdminReady } from "@/lib/firebase/admin";
import type { Level } from "@/lib/data";

// Must run in the Node.js runtime (not Edge) because firebase-admin needs
// Node APIs. This is a normal Vercel Serverless Function — fine on the
// Hobby (free) plan.
export const runtime = "nodejs";

// How long a cached rollup stays valid before we recompute it. This is the
// knob that keeps this cheap: no matter how many HR/admin dashboards load
// in a given window, at most one of them pays for the expensive full-scan
// read — everyone else gets a single, tiny cached-doc read. Raise this if
// you want fewer Firestore reads / less Vercel compute; lower it if you
// want fresher numbers.
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const AGGREGATE_ROLES = ["super_admin", "mi_admin", "hr_client", "admedika"];

export interface PlatformStats {
  totalUsers: number;
  totalEmployees: number;
  totalAssessmentsCompleted: number;
  assessmentCompletionRate: number;
  stressDistribution: { high: number; medium: number; low: number };
  totalWebinars: number;
  totalWebinarRegistrations: number;
  departmentBreakdown: { department: string; count: number }[];
  totalCompanies: number;
  totalPsychologists: number;
  totalCounselingSessions: number;
}

export interface RecentAssessment {
  id: string;
  userName: string;
  title: string;
  level: Level;
  createdAt?: unknown;
}

async function verifyCaller(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const idToken = authHeader.slice(7);
  if (!adminAuth) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

// Ported from the old client-side lib/firestore/analytics.ts, but running
// server-side with the Admin SDK (bypasses Firestore rules entirely — that
// is safe here specifically because access to *this route* is gated on the
// caller's verified role/company above, and the result is an aggregate).
async function computeStats(company?: string): Promise<PlatformStats> {
  const fdb = adminDb!;

  const usersQuery = company
    ? fdb.collection("users").where("role", "==", "employee").where("company", "==", company)
    : fdb.collection("users").where("role", "==", "employee");
  const usersSnap = await usersQuery.get();
  const totalEmployees = usersSnap.size;
  const scopedUids = company ? new Set(usersSnap.docs.map((d) => d.id)) : null;

  const deptCounts = new Map<string, number>();
  usersSnap.docs.forEach((d) => {
    const dept = (d.data().department as string | undefined)?.trim();
    if (dept) deptCounts.set(dept, (deptCounts.get(dept) || 0) + 1);
  });
  const departmentBreakdown = Array.from(deptCounts.entries())
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);

  const totalUsersCount = company
    ? totalEmployees
    : (await fdb.collection("users").count().get()).data().count;

  const stressResultsSnap = await fdb
    .collection("assessmentResults")
    .where("dimension", "==", "stress")
    .get();
  const latestStressByUser = new Map<string, Level>();
  stressResultsSnap.docs.forEach((d) => {
    const data = d.data() as { uid: string; level: Level };
    if (scopedUids && !scopedUids.has(data.uid)) return;
    latestStressByUser.set(data.uid, data.level);
  });
  const stressDistribution = { high: 0, medium: 0, low: 0 };
  latestStressByUser.forEach((level) => {
    if (level === "High") stressDistribution.high++;
    else if (level === "Medium") stressDistribution.medium++;
    else if (level === "Low") stressDistribution.low++;
  });

  const allResultsSnap = await fdb.collection("assessmentResults").get();
  const usersWithResults = new Set<string>();
  let scopedResultsCount = 0;
  allResultsSnap.docs.forEach((d) => {
    const uid = (d.data() as { uid: string }).uid;
    if (scopedUids && !scopedUids.has(uid)) return;
    usersWithResults.add(uid);
    scopedResultsCount++;
  });
  const assessmentCompletionRate =
    totalEmployees > 0 ? Math.round((usersWithResults.size / totalEmployees) * 100) : 0;

  const webinarsCount = (await fdb.collection("webinars").count().get()).data().count;
  const webinarRegsCount = (await fdb.collection("webinarRegistrations").count().get()).data().count;
  const psychologistsCount = (await fdb.collection("psychologists").count().get()).data().count;

  let totalCounselingSessions: number;
  if (company && scopedUids) {
    const bookingsSnap = await fdb.collection("counselingBookings").get();
    totalCounselingSessions = bookingsSnap.docs.filter((d) =>
      scopedUids.has((d.data() as { uid: string }).uid)
    ).length;
  } else {
    totalCounselingSessions = (await fdb.collection("counselingBookings").count().get()).data().count;
  }

  const totalCompanies = company
    ? 1
    : new Set(
        usersSnap.docs.map((d) => (d.data().company as string | undefined)?.trim()).filter(Boolean)
      ).size;

  return {
    totalUsers: totalUsersCount,
    totalEmployees,
    totalAssessmentsCompleted: company ? scopedResultsCount : allResultsSnap.size,
    assessmentCompletionRate,
    stressDistribution,
    totalWebinars: webinarsCount,
    totalWebinarRegistrations: webinarRegsCount,
    departmentBreakdown,
    totalCompanies,
    totalPsychologists: psychologistsCount,
    totalCounselingSessions,
  };
}

// Recent assessments feed is only used by the whole-platform dashboards
// (admin / super-admin), so it's always computed globally, cached inside
// the "platform" cache doc alongside platform-wide stats.
async function computeRecentAssessments(max: number): Promise<RecentAssessment[]> {
  const fdb = adminDb!;
  const resultsSnap = await fdb
    .collection("assessmentResults")
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();
  if (resultsSnap.empty) return [];

  const usersSnap = await fdb.collection("users").get();
  const nameByUid = new Map<string, string>();
  usersSnap.docs.forEach((d) => nameByUid.set(d.id, (d.data().name as string) || "Karyawan"));

  return resultsSnap.docs.map((d) => {
    const data = d.data() as { uid: string; title: string; level: Level; createdAt?: unknown };
    return {
      id: d.id,
      userName: nameByUid.get(data.uid) || "Karyawan",
      title: data.title,
      level: data.level,
      createdAt: data.createdAt,
    };
  });
}

export async function GET(req: NextRequest) {
  if (!isAdminReady() || !adminDb || !adminAuth) {
    return NextResponse.json(
      { error: "Server belum dikonfigurasi (Firebase Admin credentials belum diset)" },
      { status: 503 }
    );
  }

  const uid = await verifyCaller(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const callerSnap = await adminDb.doc(`users/${uid}`).get();
  const callerData = callerSnap.data();
  const role = callerData?.role as string | undefined;

  if (!role || !AGGREGATE_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // HR is ALWAYS locked to their own company, derived from their verified
  // profile doc — never from a client-supplied query param. That's the
  // whole point: an HR account can no longer widen its own scope, unlike
  // the old direct-SDK read.
  const company = role === "hr_client" ? (callerData?.company as string | undefined) : undefined;
  const includeRecent = req.nextUrl.searchParams.get("include") === "recent";
  const max = Math.min(Math.max(Number(req.nextUrl.searchParams.get("max")) || 8, 1), 20);

  const cacheKey = company ? `company_${company}` : "platform";
  const cacheRef = adminDb.doc(`statsCache/${cacheKey}`);
  const cacheSnap = await cacheRef.get();
  const now = Date.now();
  const cached = cacheSnap.exists
    ? (cacheSnap.data() as {
        computedAt: number;
        stats: PlatformStats;
        recentAssessments?: RecentAssessment[];
      })
    : null;
  const isFresh = !!cached && now - cached.computedAt < CACHE_TTL_MS;

  let stats: PlatformStats;
  let recentAssessments: RecentAssessment[] | undefined = cached?.recentAssessments;

  if (isFresh && cached) {
    stats = cached.stats;
    // Cache had no recent-assessments payload yet (e.g. company-scoped
    // cache doc) but this request wants them — top up just that part
    // instead of paying for a full stats recompute.
    if (includeRecent && !company && (!recentAssessments || recentAssessments.length < max)) {
      recentAssessments = await computeRecentAssessments(Math.max(max, 8));
      await cacheRef.set({ computedAt: cached.computedAt, stats, recentAssessments }, { merge: true });
    }
  } else {
    stats = await computeStats(company);
    if (includeRecent && !company) {
      recentAssessments = await computeRecentAssessments(Math.max(max, 8));
    }
    await cacheRef.set({ computedAt: now, stats, ...(recentAssessments ? { recentAssessments } : {}) });
  }

  return NextResponse.json({
    stats,
    recentAssessments: includeRecent ? (recentAssessments || []).slice(0, max) : undefined,
    cached: isFresh,
    computedAt: cached && isFresh ? cached.computedAt : now,
  });
}
