import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminReady } from "@/lib/firebase/admin";

export async function GET() {
  if (!isAdminReady() || !adminDb) {
    return NextResponse.json({ otpEnabled: false, configured: false });
  }
  const snap = await adminDb.doc("settings/security").get();
  const otpEnabled = snap.exists ? snap.data()?.otpEnabled ?? false : false;
  return NextResponse.json({ otpEnabled, configured: true });
}

// NOTE: this endpoint is intentionally simple for the prototype. In production,
// wrap this in an auth check that verifies the caller's Firebase ID token has
// role "super_admin" or "mi_admin" before allowing writes.
export async function POST(req: NextRequest) {
  try {
    const { otpEnabled } = await req.json();
    if (typeof otpEnabled !== "boolean") {
      return NextResponse.json({ error: "otpEnabled harus boolean" }, { status: 400 });
    }
    if (!isAdminReady() || !adminDb) {
      return NextResponse.json(
        { error: "Server belum dikonfigurasi (Firebase Admin credentials belum diset)" },
        { status: 503 }
      );
    }
    await adminDb.doc("settings/security").set({ otpEnabled }, { merge: true });
    return NextResponse.json({ otpEnabled });
  } catch (err) {
    console.error("settings/otp error", err);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
