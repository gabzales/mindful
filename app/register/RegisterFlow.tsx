"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { Check, ShieldAlert, Eye, EyeOff } from "lucide-react";
=======
import { Check, ShieldAlert } from "lucide-react";
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
import { createUserWithEmailAndPassword, sendEmailVerification, reload } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { Skeleton } from "@/components/Skeleton";
import type { Role } from "@/lib/roles";
import { roleRoutes } from "@/lib/roles";

// Roles a person can self-select at signup. Super Admin and MI Administrator
// are intentionally excluded — those are sensitive/privileged roles that must
// be granted by an existing admin, never chosen freely at registration.
const SELECTABLE_ROLES: { value: Role; label: string; desc: string }[] = [
  { value: "employee", label: "Employee", desc: "Karyawan biasa — assessment, konseling, webinar." },
  { value: "hr_client", label: "HR Client", desc: "Perwakilan HR perusahaan klien." },
  { value: "psychologist", label: "Psikolog", desc: "Psikolog mitra yang menangani sesi konseling." },
  { value: "admedika", label: "AdMedika", desc: "Mitra AdMedika, akses laporan utilisasi." },
];

export function RegisterFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 role, 1 email, 2 otp, 3 password, 4 biodata
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>("employee");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
<<<<<<< HEAD
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
=======
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
  const [biodata, setBiodata] = useState({
    name: "",
    company: "",
    department: "",
    jobLevel: "",
    gender: "",
    age: "",
  });

  const steps = otpRequired
    ? ["Role", "Email", "Verifikasi OTP", "Buat Password", "Lengkapi Biodata"]
    : ["Role", "Email", "Buat Password", "Lengkapi Biodata"];
  // When OTP is skipped, steps 3/4 collapse to displayed 2/3
  const displayStep = otpRequired ? step : step <= 1 ? step : step - 1;

  async function handleEmailSubmit() {
    if (!email.trim() || !email.includes("@")) {
      setError("Masukkan email yang valid");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If OTP backend isn't configured, don't block registration — just skip OTP.
        setOtpRequired(false);
        setStep(3);
        return;
      }
      if (data.otpEnabled) {
        setOtpRequired(true);
        setOtpSentNotice(`Kode verifikasi telah dikirim ke ${email}`);
        setStep(2);
      } else {
        setOtpRequired(false);
        setStep(3);
      }
    } catch {
      // Network/mailer failure: don't block the whole registration flow.
      setOtpRequired(false);
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit() {
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Masukkan kode 6 digit yang benar");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kode salah");
        return;
      }
      setStep(3);
    } catch {
      setError("Gagal memverifikasi kode, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    try {
      await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setOtpSentNotice(`Kode baru telah dikirim ke ${email}`);
    } catch {
      setError("Gagal mengirim ulang kode");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i < displayStep
                  ? "bg-success text-white"
                  : i === displayStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-sunk text-ink-soft"
              }`}
            >
              {i < displayStep ? <Check size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8">
        {step === 0 && (
          <>
            <h1 className="font-display text-xl font-semibold text-ink">
              Daftar Sebagai
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Pilih peran yang sesuai dengan posisi kamu.
            </p>
            <div className="mt-6 space-y-3">
              {SELECTABLE_ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`w-full rounded-lg border p-3.5 text-left transition-colors ${
                    role === r.value
                      ? "border-primary bg-surface-sunk"
                      : "border-border hover:bg-surface-sunk"
                  }`}
                >
                  <p className="text-sm font-semibold text-ink">{r.label}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">{r.desc}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2 rounded-lg bg-surface-sunk p-3 text-xs text-ink-soft">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-accent" />
              <span>
                Peran Administrator dan Super Admin tidak bisa dipilih sendiri di sini —
                akun tersebut hanya bisa diberikan oleh Super Admin yang sudah ada.
              </span>
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft"
            >
              Lanjutkan
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="font-display text-xl font-semibold text-ink">
              Email Perusahaan
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Masukkan email perusahaan kamu untuk mendaftar.
            </p>
            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Email Perusahaan
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <button
              onClick={handleEmailSubmit}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Lanjutkan"}
            </button>
            <button
              onClick={() => setStep(0)}
              type="button"
              className="mt-3 w-full text-center text-sm font-medium text-ink-soft hover:underline"
            >
              Kembali
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-display text-xl font-semibold text-ink">
              Verifikasi Email
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{otpSentNotice}</p>
            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Kode OTP (6 digit)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-center text-lg tracking-[0.5em] text-ink outline-none focus:border-primary"
              />
            </div>
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <button
              onClick={handleOtpSubmit}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Verifikasi"}
            </button>
            <button
              onClick={handleResendOtp}
              type="button"
              className="mt-3 w-full text-center text-sm font-medium text-primary hover:underline"
            >
              Kirim ulang kode
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="font-display text-xl font-semibold text-ink">
              Buat Password
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Gunakan password yang kuat dan mudah kamu ingat.
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Password
                </label>
<<<<<<< HEAD
                <div className="relative">
                  <input
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
=======
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Konfirmasi Password
                </label>
<<<<<<< HEAD
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background pl-3.5 pr-10 py-2.5 text-sm text-ink outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink focus:outline-none"
                    aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
=======
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <button
              onClick={() => {
                if (password.length < 6) {
                  setError("Password minimal 6 karakter");
                  return;
                }
                if (password !== confirmPassword) {
                  setError("Password dan konfirmasi tidak cocok");
                  return;
                }
                setError("");
                setStep(4);
              }}
              className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft"
            >
              Lanjutkan
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="font-display text-xl font-semibold text-ink">
              Lengkapi Biodata
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Data ini membantu kami memberi rekomendasi yang lebih tepat.
            </p>
            <div className="mt-6 space-y-4">
              <input
                placeholder="Nama Lengkap"
                value={biodata.name}
                onChange={(e) => setBiodata({ ...biodata, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
              <input
                placeholder="Nama Perusahaan"
                value={biodata.company}
                onChange={(e) => setBiodata({ ...biodata, company: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Department"
                  value={biodata.department}
                  onChange={(e) =>
                    setBiodata({ ...biodata, department: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
                <input
                  placeholder="Job Level"
                  value={biodata.jobLevel}
                  onChange={(e) =>
                    setBiodata({ ...biodata, jobLevel: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Gender"
                  value={biodata.gender}
                  onChange={(e) => setBiodata({ ...biodata, gender: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
                <input
                  placeholder="Usia"
                  value={biodata.age}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setBiodata({ ...biodata, age: val });
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <button
              onClick={async () => {
                if (!biodata.name.trim()) {
                  setError("Nama lengkap harus diisi");
                  return;
                }
                if (!biodata.company.trim()) {
                  setError("Nama perusahaan harus diisi");
                  return;
                }
                if (!biodata.department.trim()) {
                  setError("Department harus diisi");
                  return;
                }
                if (!biodata.jobLevel.trim()) {
                  setError("Job Level harus diisi");
                  return;
                }
                if (!biodata.gender.trim()) {
                  setError("Gender harus diisi");
                  return;
                }
                if (!biodata.age.trim()) {
                  setError("Usia harus diisi");
                  return;
                }

                setError("");
                setLoading(true);

                if (!auth || !db) {
                  setError("Firebase not configured");
                  setLoading(false);
                  return;
                }

                const fbAuth = auth;
                const fbDb = db;

                try {
                  const cred = await createUserWithEmailAndPassword(
                    fbAuth,
                    email,
                    password
                  );
                  await setDoc(doc(fbDb, "users", cred.user.uid), {
                    uid: cred.user.uid,
                    email,
                    name: biodata.name.trim(),
                    company: biodata.company.trim(),
                    department: biodata.department.trim(),
                    jobLevel: biodata.jobLevel.trim(),
                    gender: biodata.gender.trim(),
                    age: Number(biodata.age),
                    role,
                    createdAt: serverTimestamp(),
                  });
                  if (!otpRequired) {
                    // Fall back to Firebase's own email-link verification
                    // when OTP verification wasn't used.
                    await sendEmailVerification(cred.user, {
                      url: `${window.location.origin}/verify`,
                    });
                    router.push("/verify?sent=1");
                  } else {
                    // Mark this Firebase Auth user as email-verified server-side
                    // (since they already proved ownership via the OTP code),
                    // then reload so the client's cached user object picks up
                    // the change before we redirect into a gated dashboard.
                    try {
                      await fetch("/api/otp/confirm-account", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, uid: cred.user.uid }),
                      });
                      await reload(cred.user);
                    } catch {
                      // Non-fatal: worst case the user has to click the
                      // Firebase email-link separately.
                    }
                    router.push(roleRoutes[role] || "/dashboard");
                  }
                } catch (e: unknown) {
                  setError(e instanceof Error ? e.message : "Gagal mendaftar");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Skeleton className="inline-block h-4 w-4 rounded-full" />
                  Mendaftarkan...
                </span>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
