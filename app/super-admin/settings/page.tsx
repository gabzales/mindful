"use client";

import { useEffect, useState } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useUserProfile } from "@/hooks/useUserProfile";
import { db, isFirebaseReady } from "@/lib/firebase/config";
import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";

function SuperAdminSettingsInner() {
  const { profile, user, updateProfile, changePassword, saving, error, success, clearMessages } = useUserProfile();
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [otpLoading, setOtpLoading] = useState(true);
  const [otpSaving, setOtpSaving] = useState(false);
  const [otpMsg, setOtpMsg] = useState("");

  const [demoModeEnabled, setDemoModeEnabled] = useState(true);
  const [demoLoading, setDemoLoading] = useState(true);
  const [demoSaving, setDemoSaving] = useState(false);
  const [demoMsg, setDemoMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings/otp")
      .then((r) => r.json())
      .then((d) => setOtpEnabled(!!d.otpEnabled))
      .catch(() => {})
      .finally(() => setOtpLoading(false));
  }, []);

  useEffect(() => {
    if (!isFirebaseReady() || !db) {
      setDemoLoading(false);
      return;
    }
    const unsub = onSnapshot(
      doc(db, "settings", "security"),
      (snap) => {
        setDemoModeEnabled(snap.data()?.demoModeEnabled ?? true);
        setDemoLoading(false);
      },
      () => setDemoLoading(false)
    );
    return unsub;
  }, []);

  async function toggleOtp() {
    const next = !otpEnabled;
    setOtpSaving(true);
    setOtpMsg("");
    try {
      const res = await fetch("/api/settings/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpEnabled: next }),
      });
      if (!res.ok) {
        const d = await res.json();
        setOtpMsg(d.error || "Gagal menyimpan pengaturan");
        return;
      }
      setOtpEnabled(next);
      setOtpMsg(next ? "Verifikasi OTP diaktifkan" : "Verifikasi OTP dinonaktifkan");
    } catch {
      setOtpMsg("Gagal menyimpan pengaturan");
    } finally {
      setOtpSaving(false);
    }
  }

  async function toggleDemoMode() {
    if (!db) {
      setDemoMsg("Firebase belum dikonfigurasi");
      return;
    }
    const next = !demoModeEnabled;
    setDemoSaving(true);
    setDemoMsg("");
    try {
      await setDoc(doc(db, "settings", "security"), { demoModeEnabled: next }, { merge: true });
      setDemoModeEnabled(next);
      setDemoMsg(next ? "Mode demo diaktifkan" : "Mode demo dinonaktifkan — semua role wajib login");
    } catch {
      setDemoMsg("Gagal menyimpan pengaturan");
    } finally {
      setDemoSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();
    const fd = new FormData(e.currentTarget);
    await updateProfile({ name: fd.get("name") as string });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Pengaturan Akun</h1>
      {success && <p className="rounded-lg bg-success/10 px-4 py-3 text-sm font-medium text-success">{success}</p>}
      {error && <p className="rounded-lg bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-8 space-y-6">
        <Field name="name" label="Nama" defaultValue={profile?.name || ""} />
        <Field name="email" label="Email" defaultValue={user?.email || ""} disabled />
        <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

      <div className="rounded-2xl border border-border bg-surface p-8 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Mode Demo</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Izinkan akses tanpa login ke halaman role</p>
            <p className="text-sm text-ink-soft">
              Bila aktif, halaman Employee, HR, Admin, Super Admin, Psikolog, dan AdMedika
              bisa dibuka langsung dari landing page tanpa perlu login (untuk showcase/demo).
              Bila nonaktif, semua halaman tersebut wajib login dengan role yang sesuai.
            </p>
          </div>
          <button
            onClick={toggleDemoMode}
            disabled={demoLoading || demoSaving}
            role="switch"
            aria-checked={demoModeEnabled}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
              demoModeEnabled ? "bg-primary" : "bg-surface-sunk border border-border"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                demoModeEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {demoMsg && <p className="text-sm text-ink-soft">{demoMsg}</p>}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Keamanan Pendaftaran</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Verifikasi OTP via Email (Gmail)</p>
            <p className="text-sm text-ink-soft">
              Bila aktif, calon pengguna harus memasukkan kode 6 digit yang dikirim ke email
              mereka sebelum bisa melanjutkan pendaftaran.
            </p>
          </div>
          <button
            onClick={toggleOtp}
            disabled={otpLoading || otpSaving}
            role="switch"
            aria-checked={otpEnabled}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
              otpEnabled ? "bg-primary" : "bg-surface-sunk border border-border"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                otpEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {otpMsg && <p className="text-sm text-ink-soft">{otpMsg}</p>}
        <p className="text-xs text-ink-soft">
          Catatan: memerlukan variabel environment <code>GMAIL_USER</code>,{" "}
          <code>GMAIL_APP_PASSWORD</code>, dan kredensial Firebase Admin di server agar email
          bisa terkirim.
        </p>
      </div>

      {user?.providerData?.some((p) => p?.providerId === "password") && (
        <form onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          await changePassword(fd.get("currentPassword") as string, fd.get("newPassword") as string);
        }} className="rounded-2xl border border-border bg-surface p-8 space-y-6">
          <h2 className="font-display text-lg font-semibold text-ink">Ubah Password</h2>
          <Field name="currentPassword" label="Password Saat Ini" type="password" />
          <Field name="newPassword" label="Password Baru" type="password" />
          <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50">
            {saving ? "Menyimpan..." : "Ubah"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function SuperAdminSettings() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
      <SuperAdminSettingsInner />
    </RoleGuard>
  );
}

function Field({ label, name, type = "text", defaultValue, disabled }: { label: string; name: string; type?: string; defaultValue?: string; disabled?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} disabled={disabled} className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary disabled:opacity-50" />
    </div>
  );
}
