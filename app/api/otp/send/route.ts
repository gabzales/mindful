import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminReady } from "@/lib/firebase/admin";
import { sendOtpEmail } from "@/lib/mailer";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }

    if (!isAdminReady() || !adminDb) {
      return NextResponse.json(
        { error: "Server belum dikonfigurasi (Firebase Admin credentials belum diset)" },
        { status: 503 }
      );
    }

    // Check whether OTP verification is enabled by the admin panel.
    const settingsSnap = await adminDb.doc("settings/security").get();
    const otpEnabled = settingsSnap.exists ? settingsSnap.data()?.otpEnabled ?? false : false;

    if (!otpEnabled) {
      return NextResponse.json({ skipped: true, otpEnabled: false });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_TTL_MS;

    await adminDb.doc(`otpCodes/${email.toLowerCase()}`).set({
      code,
      expiresAt,
      attempts: 0,
      createdAt: Date.now(),
    });

    await sendOtpEmail(email, code);

    return NextResponse.json({ sent: true, otpEnabled: true });
  } catch (err) {
    console.error("otp/send error", err);
    const message = err instanceof Error ? err.message : "Gagal mengirim OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
