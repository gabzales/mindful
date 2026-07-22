"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { signInWithGoogle, signInWithEmail } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase/config";
import { roleRoutes, type Role } from "@/lib/roles";
import { Skeleton } from "@/components/Skeleton";
<<<<<<< HEAD
import { Eye, EyeOff } from "lucide-react";
=======
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const [showPassword, setShowPassword] = useState(false);
=======
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd

  async function redirectByRole(uid: string) {
    if (!db) {
      router.push("/dashboard");
      return;
    }
    const snap = await getDoc(doc(db, "users", uid));
    const role = (snap.exists() ? (snap.data().role as Role) : "employee") || "employee";
    router.push(roleRoutes[role] || "/dashboard");
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      await redirectByRole(user.uid);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal masuk dengan Google");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
<<<<<<< HEAD
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email dan password wajib diisi");
      return;
    }
    
    // Check for hardcoded dummy account
    if (trimmedEmail === "andi.pratama@mindfulness.id" && password === "password123") {
      localStorage.setItem("mock_user", "true");
      window.location.href = "/dashboard";
      return;
    }

    setLoading(true);
    try {
      const user = await signInWithEmail(trimmedEmail, password);
=======
    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const user = await signInWithEmail(email.trim(), password);
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
      await redirectByRole(user.uid);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal masuk";
      setError(
        msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")
          ? "Email atau password salah"
          : msg
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-10 w-44" />
          </div>
          <div className="rounded-2xl border border-border bg-surface p-8 space-y-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
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
          <h1 className="font-display text-xl font-semibold text-ink">Masuk</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Masuk ke akun Employee Wellbeing Portal kamu. Role kamu (employee, HR,
            psikolog, admin, dsb) terbaca otomatis dan diarahkan ke dashboard yang sesuai.
          </p>

          <form onSubmit={handleEmailSignIn} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
<<<<<<< HEAD
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background pl-3.5 pr-10 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink focus:outline-none"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

=======
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
            >
              Masuk
            </button>
          </form>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-ink-soft">atau</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-sunk disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Masuk dengan Google
            </button>

            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-lg border border-border bg-surface py-2.5 text-sm font-semibold text-ink hover:bg-surface-sunk"
            >
              Belum punya akun? Daftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
