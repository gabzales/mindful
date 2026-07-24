"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Pencil, X, Building2 } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";
import {
  subscribeCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  type Company,
  type NewCompany,
} from "@/lib/firestore/companies";

const emptyForm: NewCompany = {
  name: "",
  picName: "",
  picEmail: "",
  picPhone: "",
  employeeQuota: undefined,
  status: "active",
  notes: "",
};

function CompaniesPageInner() {
  const [list, setList] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewCompany>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeCompanies((c) => {
      setList(c);
      setLoading(false);
    });
    return unsub;
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(c: Company) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      picName: c.picName || "",
      picEmail: c.picEmail || "",
      picPhone: c.picPhone || "",
      employeeQuota: c.employeeQuota,
      status: c.status,
      notes: c.notes || "",
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Nama perusahaan wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // IMPORTANT: `name` here must match exactly what's stored in the
      // `company` field on employee/HR profiles (see lib/roles.ts) — that's
      // the freeform string every dashboard/API already scopes by. This
      // directory doesn't auto-sync existing user profiles if you rename a
      // company here; it's a management convenience layer on top of the
      // existing string, not a migration to a normalized companyId.
      if (editingId) {
        await updateCompany(editingId, form);
      } else {
        await createCompany(form);
      }
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan data perusahaan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus perusahaan ini dari daftar? Karyawan yang sudah terdaftar dengan nama perusahaan ini tidak akan ikut terhapus.")) return;
    try {
      await deleteCompany(id);
    } catch {
      alert("Gagal menghapus data perusahaan");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Image src="/mindfulness-logo.png" alt="Mindfulness Indonesia" width={120} height={30} className="hidden shrink-0 sm:block" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-soft">Super Admin</p>
              <h1 className="truncate font-display text-xl font-semibold text-ink">Kelola Companies</h1>
            </div>
          </div>
          <Link href="/super-admin" className="shrink-0 text-sm font-medium text-ink-soft hover:text-ink">
            &larr; Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            Nama perusahaan di sini harus sama persis dengan yang diisi karyawan/HR saat
            registrasi, supaya dashboard HR &amp; AdMedika bisa mengelompokkan data dengan benar.
          </p>
          <button
            onClick={openCreate}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-soft"
          >
            <Plus size={16} /> Perusahaan Baru
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">
                {editingId ? "Edit Perusahaan" : "Perusahaan Baru"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-ink-soft hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Nama perusahaan (mis. PT Sinergi Digital)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  placeholder="Nama PIC"
                  value={form.picName}
                  onChange={(e) => setForm({ ...form, picName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
                <input
                  type="email"
                  placeholder="Email PIC"
                  value={form.picEmail}
                  onChange={(e) => setForm({ ...form, picEmail: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
                <input
                  placeholder="No. HP PIC"
                  value={form.picPhone}
                  onChange={(e) => setForm({ ...form, picPhone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Kuota karyawan"
                  value={form.employeeQuota ?? ""}
                  onChange={(e) => setForm({ ...form, employeeQuota: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Status Kontrak</label>
                <div className="flex gap-2">
                  {(["active", "inactive"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                        form.status === s ? "border-primary bg-surface-sunk text-ink" : "border-border text-ink-soft hover:bg-surface-sunk"
                      }`}
                    >
                      {s === "active" ? "Aktif" : "Tidak Aktif"}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Catatan (opsional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Perusahaan"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-ink-soft">Memuat...</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-ink-soft">Belum ada perusahaan. Klik &quot;Perusahaan Baru&quot; untuk menambahkan.</p>
        ) : (
          <div className="space-y-3">
            {list.map((c) => (
              <div key={c.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {c.name}
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          c.status === "active" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        }`}
                      >
                        {c.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </p>
                    <p className="truncate text-sm text-ink-soft">
                      {c.picName || "PIC belum diisi"}
                      {c.employeeQuota ? ` · Kuota ${c.employeeQuota} karyawan` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => openEdit(c)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunk">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10">
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CompaniesAdminPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
      <CompaniesPageInner />
    </RoleGuard>
  );
}
