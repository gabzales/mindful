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
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function redirectByRole(uid: string) {
    if (!db) {
      router.push("/dashboard");
      return;
    }
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data();
      const role = data.role as Role;
      router.push(roleRoutes[role] || "/dashboard");
    } else {
      router.push("/dashboard");
    }
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
    <div className="flex min-h-screen bg-[#2A093D] overflow-hidden">
      {/* Left Column: Login Form Card */}
      <div className="relative flex w-full flex-col justify-center items-center px-6 py-12 lg:w-1/2 bg-white lg:rounded-r-[48px] z-20 shadow-2xl min-h-screen">
        
        {/* Top-Left Logo (mindful.png) - Enlarge size and give padding */}
        <div className="absolute top-8 left-8 sm:top-10 sm:left-10 z-30">
          <Link href="/">
            <Image
              src="/mindful.png"
              alt="Mindfulness Indonesia"
              width={200}
              height={104}
              priority
              className="h-14 sm:h-16 w-auto object-contain hover:opacity-85 transition-opacity"
            />
          </Link>
        </div>

        {/* Clean, Modern Form Container */}
        <div className="w-full max-w-md px-6 mt-28 lg:mt-0 flex flex-col justify-center">
          <h1 className="font-display text-3xl font-extrabold text-[#2A093D] tracking-tight">Masuk</h1>
          <p className="mt-2 text-xs sm:text-sm text-ink-soft leading-relaxed">
            Masuk ke akun Employee Wellbeing Portal kamu. Role kamu terbaca otomatis dan diarahkan ke dashboard yang sesuai.
          </p>

          <form onSubmit={handleEmailSignIn} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#2A093D]">
                Email Perusahaan
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/70 pointer-events-none">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full rounded-2xl border border-border/80 bg-white pl-11 pr-4 py-3.5 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-xs hover:border-border-hover"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#2A093D]">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/70 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border/80 bg-white pl-11 pr-12 py-3.5 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-xs hover:border-border-hover"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft hover:text-[#2A093D] focus:outline-none transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {error && <p className="text-xs font-medium text-danger">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-soft disabled:opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-md shadow-primary/10 hover:shadow-lg"
            >
              Masuk
            </button>
          </form>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-ink-soft font-semibold">atau masuk dengan</span>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border/80 bg-white px-4 py-3.5 text-sm font-bold text-ink transition-all duration-200 hover:bg-[#F7F4FA] hover:border-primary/20 disabled:opacity-50 cursor-pointer shadow-xs transform hover:-translate-y-0.5 active:translate-y-0"
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
              Google Workspace
            </button>

            <div className="text-center text-xs text-ink-soft font-medium">
              Belum punya akun?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline hover:text-primary-soft transition-colors">
                Daftar sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Branding Hero & Corporate Trust Banner (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 text-white overflow-hidden bg-[#2A093D]">
        {/* Grid Mesh Overlay & Ambient Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1.5px,transparent_1.5px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] opacity-80 pointer-events-none" />
        
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary-soft/30 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "14s" }} />

        {/* Content Container (z-20 so it remains sharp and readable) */}
        <div className="relative z-20 flex flex-col justify-between h-full">
          <div className="h-10" />

          {/* Hero titles & description */}
          <div className="space-y-6 max-w-md my-auto text-left">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFA400] bg-white/10 px-3.5 py-1 rounded-full border border-white/5">
                Authorized Institution
              </span>
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-[#FFA400] leading-tight mt-3">
                Welcome to
              </h2>
              <h2 className="font-display text-5xl sm:text-6xl font-black tracking-tight text-white leading-none">
                Mindfulness
              </h2>
              <h2 className="font-display text-5xl sm:text-6xl font-black tracking-tight text-white leading-none mt-1">
                Indonesia
              </h2>
            </div>
            
            <p className="text-sm text-purple-100/90 leading-relaxed font-medium">
              Mindfulness Indonesia is the first and only authorized Mindfulness institution in Indonesia. Established in 2016, we offer guided Mindfulness training practice by certified instructors.
            </p>
          </div>

          {/* Trust section on purple background */}
          <div className="flex flex-col items-center border-t border-white/10 pt-8">
            <p className="text-[10px] font-bold text-[#FFA400]/80 uppercase tracking-widest mb-6">
              Trusted by corporate teams at:
            </p>
            <div className="relative w-full h-32 flex items-center justify-center">
              <Image
                src="/Clients-2.png"
                alt="Trusted corporate teams"
                fill
                className="object-contain pointer-events-none filter grayscale invert brightness-200 contrast-150 opacity-40 hover:opacity-75 transition-opacity duration-300"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
