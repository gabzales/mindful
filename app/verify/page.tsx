"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { applyActionCode, checkActionCode, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "sent">("loading");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");
    const sent = searchParams.get("sent");

    if (!auth) {
      setStatus("error");
      setMessage("Firebase not configured");
      return;
    }

    const fbAuth = auth;

    if (sent === "1") {
      setStatus("sent");
      setMessage("Cek email kamu untuk tautan verifikasi.");
      return;
    }

    if (!oobCode || mode !== "verifyEmail") {
      setStatus("error");
      setMessage("Tautan verifikasi tidak valid.");
      return;
    }

    checkActionCode(fbAuth, oobCode)
      .then(() => applyActionCode(fbAuth, oobCode))
      .then(() => {
        setStatus("success");
        setMessage("Email berhasil diverifikasi!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Gagal memverifikasi email.");
      });
  }, [searchParams]);

  async function handleResend() {
    if (!auth?.currentUser) return;
    setResending(true);
    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/verify`,
      });
      setMessage("Email verifikasi telah dikirim ulang.");
    } catch {
      setMessage("Gagal mengirim ulang.");
    }
    setResending(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="mb-8 flex justify-center">
          <Image
            src="/mindfulness-logo.png"
            alt="Mindfulness Indonesia"
            width={180}
            height={45}
            priority
          />
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-8">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="mx-auto animate-spin text-primary" size={40} />
              <p className="text-sm text-ink-soft">Memverifikasi email...</p>
            </div>
          )}

          {status === "sent" && (
            <div className="space-y-4">
              <Mail className="mx-auto text-primary" size={40} />
              <h1 className="font-display text-xl font-semibold text-ink">
                Cek Email Kamu
              </h1>
              <p className="text-sm text-ink-soft">
                Kami kirim tautan verifikasi ke email kamu.
              </p>
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-block w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
              >
                {resending ? "Mengirim..." : "Kirim Ulang"}
              </button>
              <Link
                href="/login"
                className="block text-sm font-medium text-primary hover:underline"
              >
                Kembali ke Login
              </Link>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle2 className="mx-auto text-success" size={40} />
              <h1 className="font-display text-xl font-semibold text-ink">
                Email Terverifikasi
              </h1>
              <p className="text-sm text-ink-soft">{message}</p>
              <Link
                href="/login"
                className="inline-block w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft"
              >
                Masuk ke Portal
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="mx-auto text-danger" size={40} />
              <h1 className="font-display text-xl font-semibold text-ink">
                Verifikasi Gagal
              </h1>
              <p className="text-sm text-ink-soft">{message}</p>
              <Link
                href="/login"
                className="inline-block w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft"
              >
                Kembali ke Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
