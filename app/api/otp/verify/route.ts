import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminReady } from "@/lib/firebase/admin";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Email dan kode wajib diisi" }, { status: 400 });
    }

    if (!isAdminReady() || !adminDb) {
      return NextResponse.json(
        { error: "Server belum dikonfigurasi (Firebase Admin credentials belum diset)" },
        { status: 503 }
      );
    }

    const ref = adminDb.doc(`otpCodes/${email.toLowerCase()}`);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Kode tidak ditemukan, minta kode baru" }, { status: 400 });
    }

    const data = snap.data()!;

    if (Date.now() > data.expiresAt) {
      return NextResponse.json({ error: "Kode sudah kedaluwarsa, minta kode baru" }, { status: 400 });
    }

    if (data.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Terlalu banyak percobaan, minta kode baru" }, { status: 429 });
    }

    if (data.code !== String(code).trim()) {
      await ref.update({ attempts: data.attempts + 1 });
      return NextResponse.json({ error: "Kode salah" }, { status: 400 });
    }

    await ref.set({ verified: true, verifiedAt: Date.now() }, { merge: true });
    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("otp/verify error", err);
    const message = err instanceof Error ? err.message : "Gagal memverifikasi OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
