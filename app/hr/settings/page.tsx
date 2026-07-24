"use client";

import { useUserProfile } from "@/hooks/useUserProfile";

export default function HrSettings() {
  const { profile, user, updateProfile, saving, error, success, clearMessages } = useUserProfile();

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
