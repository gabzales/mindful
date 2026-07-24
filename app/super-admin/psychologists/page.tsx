"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";
import {
  subscribePsychologists,
  createPsychologist,
  updatePsychologist,
  deletePsychologist,
  findUidByEmail,
  type Psychologist,
  type NewPsychologist,
  type WeeklyAvailability,
} from "@/lib/firestore/counseling";

const DAYS = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();
}

const emptyForm: NewPsychologist = {
  name: "",
  specialty: "",
  photo: "",
  availability: [],
};

function PsychologistsPageInner() {
  const [list, setList] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewPsychologist>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [linkEmail, setLinkEmail] = useState("");

  useEffect(() => {
    const unsub = subscribePsychologists((p) => {
      setList(p);
      setLoading(false);
    });
    return unsub;
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setLinkEmail("");
    setShowForm(true);
    setError("");
  }

  function openEdit(p: Psychologist) {
    setEditingId(p.id);
    setForm({ name: p.name, specialty: p.specialty, photo: p.photo, availability: p.availability, linkedUid: p.linkedUid });
    setLinkEmail("");
    setShowForm(true);
    setError("");
  }

  function toggleDay(dayOfWeek: number) {
    const exists = form.availability.find((a) => a.dayOfWeek === dayOfWeek);
    if (exists) {
      setForm({ ...form, availability: form.availability.filter((a) => a.dayOfWeek !== dayOfWeek) });
    } else {
      setForm({
        ...form,
        availability: [...form.availability, { dayOfWeek, times: ["09.00", "13.00"] }],
      });
    }
  }

  function updateDayTimes(dayOfWeek: number, timesStr: string) {
    const times = timesStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setForm({
      ...form,
      availability: form.availability.map((a) =>
        a.dayOfWeek === dayOfWeek ? { ...a, times } : a
      ),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.specialty.trim()) {
      setError("Nama dan spesialisasi wajib diisi");
      return;
    }
    if (form.availability.length === 0) {
      setError("Pilih minimal 1 hari ketersediaan");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let linkedUid = form.linkedUid;
      if (linkEmail.trim()) {
        const uid = await findUidByEmail(linkEmail.trim());
        if (!uid) {
          setError(`Tidak ada akun terdaftar dengan email ${linkEmail.trim()}`);
          setSaving(false);
          return;
        }
        linkedUid = uid;
      }
      const payload = { ...form, linkedUid, photo: initialsOf(form.name) };
      if (editingId) {
        await updatePsychologist(editingId, payload);
      } else {
        await createPsychologist(payload);
      }
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan data psikolog");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus psikolog ini? Booking yang sudah ada tidak akan otomatis terhapus.")) return;
    try {
      await deletePsychologist(id);
    } catch {
      alert("Gagal menghapus data psikolog");
    }
  }

  function dayLabel(a: WeeklyAvailability) {
    return DAYS.find((d) => d.value === a.dayOfWeek)?.label || "";
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Image src="/mindfulness-logo.png" alt="Mindfulness Indonesia" width={120} height={30} className="hidden shrink-0 sm:block" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-soft">Super Admin</p>
              <h1 className="truncate font-display text-xl font-semibold text-ink">Kelola Psikolog</h1>
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
            Psikolog yang ditambahkan di sini langsung muncul di halaman Booking Konseling employee.
          </p>
          <button
            onClick={openCreate}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-soft"
          >
            <Plus size={16} /> Psikolog Baru
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">
                {editingId ? "Edit Psikolog" : "Psikolog Baru"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-ink-soft hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Nama lengkap (mis. Dr. Maya Anindita, M.Psi)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
              <input
                placeholder="Spesialisasi (mis. Stress & Burnout)"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Tautkan ke Akun Login (opsional)
                </label>
                <input
                  type="email"
                  placeholder={form.linkedUid ? "Sudah tertaut — isi untuk mengganti" : "email@psikolog.com"}
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
                <p className="mt-1 text-xs text-ink-soft">
                  Psikolog harus sudah punya akun (daftar sebagai role Psikolog) sebelum ditautkan,
                  supaya bisa melihat jadwalnya sendiri saat login.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Hari &amp; Jam Tersedia
                </label>
                <div className="space-y-2">
                  {DAYS.map((d) => {
                    const a = form.availability.find((x) => x.dayOfWeek === d.value);
                    return (
                      <div key={d.value} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleDay(d.value)}
                          className={`w-24 shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            a
                              ? "border-primary bg-surface-sunk text-ink"
                              : "border-border text-ink-soft hover:bg-surface-sunk"
                          }`}
                        >
                          {d.label}
                        </button>
                        {a && (
                          <input
                            placeholder="Jam, pisahkan koma (mis. 09.00, 11.00, 14.00)"
                            defaultValue={a.times.join(", ")}
                            onBlur={(e) => updateDayTimes(d.value, e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Psikolog"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-ink-soft">Memuat...</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-ink-soft">Belum ada psikolog. Klik &quot;Psikolog Baru&quot; untuk menambahkan.</p>
        ) : (
          <div className="space-y-3">
            {list.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {p.photo}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {p.name}
                      {!p.linkedUid && (
                        <span className="ml-2 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold text-warning">
                          Belum tertaut akun
                        </span>
                      )}
                    </p>
                    <p className="truncate text-sm text-ink-soft">
                      {p.specialty} &middot; {p.availability.map(dayLabel).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunk"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
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

export default function PsychologistsAdminPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.MI_ADMIN]}>
      <PsychologistsPageInner />
    </RoleGuard>
  );
}
