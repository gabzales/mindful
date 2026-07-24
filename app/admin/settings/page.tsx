"use client";

import { useUserProfile } from "@/hooks/useUserProfile";

export default function AdminSettings() {
  const { profile, user, updateProfile, changePassword, deleteAccount, saving, error, success, clearMessages } = useUserProfile();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();
    const fd = new FormData(e.currentTarget);
    await updateProfile({
      name: fd.get("name") as string,
      phone: fd.get("phone") as string,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Pengaturan Akun</h1>
      {success && <p className="rounded-lg bg-success/10 px-4 py-3 text-sm font-medium text-success">{success}</p>}
      {error && <p className="rounded-lg bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-8 space-y-6">
        <h2 className="font-display text-lg font-semibold text-ink">Informasi Admin</h2>
        <Field name="name" label="Nama" defaultValue={profile?.name || ""} />
        <Field name="email" label="Email" defaultValue={user?.email || ""} disabled />
        <Field name="phone" label="No. Telepon" defaultValue={profile?.phone || ""} />
        <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>

      {user?.providerData?.some((p) => p?.providerId === "password") && (
        <form onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const ok = await changePassword(
            fd.get("currentPassword") as string,
            fd.get("newPassword") as string
          );
          if (ok) (e.target as HTMLFormElement).reset();
        }} className="rounded-2xl border border-border bg-surface p-8 space-y-6">
          <h2 className="font-display text-lg font-semibold text-ink">Ubah Password</h2>
          <Field name="currentPassword" label="Password Saat Ini" type="password" />
          <Field name="newPassword" label="Password Baru" type="password" />
          <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50">
            {saving ? "Menyimpan..." : "Ubah Password"}
          </button>
        </form>
      )}

      <div className="rounded-2xl border border-border bg-surface p-8 space-y-4">
        <h2 className="font-display text-lg font-semibold text-danger">Zona Berbahaya</h2>
        <p className="text-sm text-ink-soft">Hapus akun dan semua data Anda. Tindakan ini tidak bisa dibatalkan.</p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (confirm("Apakah Anda yakin ingin menghapus akun?")) {
            await deleteAccount();
          }
        }}>
          <button type="submit" className="w-full rounded-lg border border-danger py-2.5 text-sm font-semibold text-danger hover:bg-danger/5">
            Hapus Akun
          </button>
        </form>
      </div>
    </div>
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
