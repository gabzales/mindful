import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth, isAdminReady } from "@/lib/firebase/admin";

// Same reasoning as /api/stats: HR Client must never get a raw Firestore
// read path to other employees' documents (firestore.rules intentionally
// blocks that — see the notes on match /users/{uid}). This route is the
// only sanctioned way HR sees a list of names in their own company, and it
// only ever returns non-sensitive fields (name, department, jobLevel) —
// never email, assessment scores, or counseling history. The company scope
// is always derived from the caller's own verified profile server-side,
// never from a client-supplied query param, so an HR account can't widen
// its own scope by editing the request.
export const runtime = "nodejs";

const ALLOWED_ROLES = ["hr_client", "mi_admin", "super_admin"];

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

async function getCaller(req: NextRequest) {
  const uid = await verifyCaller(req);
  if (!uid || !adminDb) return null;
  const snap = await adminDb.doc(`users/${uid}`).get();
  const data = snap.data();
  const role = data?.role as string | undefined;
  if (!role || !ALLOWED_ROLES.includes(role)) return null;
  return { uid, role, company: data?.company as string | undefined };
}

export async function GET(req: NextRequest) {
  if (!isAdminReady() || !adminDb || !adminAuth) {
    return NextResponse.json(
      { error: "Server belum dikonfigurasi (Firebase Admin credentials belum diset)" },
      { status: 503 }
    );
  }

  const caller = await getCaller(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const company = caller.role === "hr_client" ? caller.company : undefined;
  if (caller.role === "hr_client" && !company) {
    return NextResponse.json({ employees: [] });
  }

  let q = adminDb.collection("users").where("role", "==", "employee");
  if (company) q = q.where("company", "==", company);
  // NOTE: deliberately NOT chaining .orderBy("name") here — combined with
  // the two equality filters above, that would require a composite Firestore
  // index that this project doesn't provision (see the same pattern avoided
  // in /api/stats's computeStats). Sorting the small resulting list in JS
  // instead needs zero index setup.
  const snap = await q.get();

  const employees = snap.docs
    .map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        name: (data.name as string) || "-",
        department: (data.department as string) || null,
        jobLevel: (data.jobLevel as string) || null,
        company: (data.company as string) || null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ employees });
}

// Soft-remove: clears an employee's `company` field so they no longer count
// toward that company's headcount / aggregate stats. Does NOT touch their
// Auth account, assessment history, or counseling records — it only revokes
// the company association. HR can only do this to an employee currently in
// their OWN company (re-checked here server-side); mi_admin/super_admin can
// do it to anyone.
export async function PATCH(req: NextRequest) {
  if (!isAdminReady() || !adminDb || !adminAuth) {
    return NextResponse.json(
      { error: "Server belum dikonfigurasi (Firebase Admin credentials belum diset)" },
      { status: 503 }
    );
  }

  const caller = await getCaller(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const targetUid = body?.uid as string | undefined;
  if (!targetUid) return NextResponse.json({ error: "uid wajib diisi" }, { status: 400 });

  const targetSnap = await adminDb.doc(`users/${targetUid}`).get();
  const target = targetSnap.data();
  if (!target || target.role !== "employee") {
    return NextResponse.json({ error: "Employee tidak ditemukan" }, { status: 404 });
  }
  if (caller.role === "hr_client" && target.company !== caller.company) {
    return NextResponse.json({ error: "Karyawan ini bukan dari perusahaan Anda" }, { status: 403 });
  }

  await adminDb.doc(`users/${targetUid}`).update({ company: "" });
  return NextResponse.json({ ok: true });
}
