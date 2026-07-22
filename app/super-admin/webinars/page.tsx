"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";
import {
  subscribeWebinars,
  createWebinar,
  updateWebinar,
  deleteWebinar,
  type Webinar,
  type NewWebinar,
} from "@/lib/firestore/webinars";

const emptyForm: NewWebinar = { title: "", date: "", time: "", speaker: "", totalSeats: 50, zoomLink: "" };

function WebinarsPageInner() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Webinar | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewWebinar>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeWebinars((w) => {
      setWebinars(w);
      setLoading(false);
    });
    return unsub;
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(w: Webinar) {
    setEditing(w);
    setForm({ title: w.title, date: w.date, time: w.time, speaker: w.speaker, totalSeats: w.totalSeats, zoomLink: w.zoomLink || "" });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date.trim() || !form.time.trim() || !form.speaker.trim()) {
      setError("Semua field wajib diisi");
      return;
    }
    if (form.totalSeats < 1) {
      setError("Jumlah kursi minimal 1");
      return;
    }
    if (form.zoomLink && form.zoomLink.trim() && !/^https?:\/\//.test(form.zoomLink.trim())) {
      setError("Link meeting harus diawali http:// atau https://");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateWebinar(editing.id, form);
      } else {
        await createWebinar(form);
      }
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan webinar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus webinar ini? Pendaftaran yang sudah ada tidak akan otomatis terhapus.")) return;
    try {
      await deleteWebinar(id);
    } catch {
      alert("Gagal menghapus webinar");
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
              <h1 className="truncate font-display text-xl font-semibold text-ink">Kelola Webinar</h1>
            </div>
          </div>
          <Link href="/super-admin" className="shrink-0 text-sm font-medium text-ink-soft hover:text-ink">
            &larr; Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-soft">
            Webinar yang dibuat di sini langsung muncul di dashboard employee.
          </p>
          <button
            onClick={openCreate}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-soft"
          >
            <Plus size={16} /> Webinar Baru
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">
                {editing ? "Edit Webinar" : "Webinar Baru"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-ink-soft hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Judul webinar"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  placeholder="Tanggal (mis. 29 Jul 2026)"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
                <input
                  placeholder="Jam (mis. 13.00 WIB)"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
              <input
                placeholder="Nama pembicara"
                value={form.speaker}
                onChange={(e) => setForm({ ...form, speaker: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Total Kursi {editing && <span className="text-xs text-ink-soft">(kursi tersisa akan disesuaikan otomatis)</span>}
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.totalSeats}
                  onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Link Meeting (Zoom / Google Meet)
                </label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={form.zoomLink}
                  onChange={(e) => setForm({ ...form, zoomLink: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
                <p className="mt-1 text-xs text-ink-soft">
                  Link ini hanya akan ditampilkan ke peserta yang sudah mendaftar.
                </p>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Webinar"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-ink-soft">Memuat...</p>
        ) : webinars.length === 0 ? (
          <p className="text-sm text-ink-soft">Belum ada webinar. Klik &quot;Webinar Baru&quot; untuk membuat.</p>
        ) : (
          <div className="space-y-3">
            {webinars.map((w) => (
              <div
                key={w.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{w.title}</p>
                  <p className="text-sm text-ink-soft">
                    {w.speaker} &middot; {w.date} &middot; {w.time} &middot; {w.seatsLeft}/{w.totalSeats} kursi tersisa
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openEdit(w)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunk"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10"
                  >
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

export default function WebinarsAdminPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.MI_ADMIN]}>
      <WebinarsPageInner />
    </RoleGuard>
  );
}
