import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminReady } from "@/lib/firebase/admin";
import { getAuth } from "firebase-admin/auth";

// Called right after createUserWithEmailAndPassword succeeds on the client,
// but only when the registration flow went through OTP verification.
// It checks that this email was actually OTP-verified (server-side, can't be
// spoofed by the client), then marks the Firebase Auth user's emailVerified
// flag as true so pages that gate on user.emailVerified (e.g. dashboard
// layout) let them through without also requiring Firebase's separate
// email-link verification.
export async function POST(req: NextRequest) {
  try {
    const { email, uid } = await req.json();
    if (!email || !uid) {
      return NextResponse.json({ error: "Email dan uid wajib diisi" }, { status: 400 });
    }

    if (!isAdminReady() || !adminDb) {
      return NextResponse.json(
        { error: "Server belum dikonfigurasi (Firebase Admin credentials belum diset)" },
        { status: 503 }
      );
    }

    const ref = adminDb.doc(`otpCodes/${String(email).toLowerCase()}`);
    const snap = await ref.get();

    if (!snap.exists || !snap.data()?.verified) {
      return NextResponse.json({ error: "Email ini belum diverifikasi via OTP" }, { status: 400 });
    }

    await getAuth().updateUser(uid, { emailVerified: true });
    await ref.delete();

    return NextResponse.json({ confirmed: true });
  } catch (err) {
    console.error("otp/confirm-account error", err);
    const message = err instanceof Error ? err.message : "Gagal mengonfirmasi akun";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
