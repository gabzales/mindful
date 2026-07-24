"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";
import { dimensionLabels, type Dimension } from "@/lib/data";
import {
  subscribeAssessmentTypes,
  saveAssessmentType,
  deleteAssessmentType,
  type AssessmentType,
  type NewAssessmentType,
} from "@/lib/firestore/assessments";

const DIMENSIONS = Object.keys(dimensionLabels) as Dimension[];

const emptyForm: NewAssessmentType = {
  slug: "",
  dimension: "stress",
  title: "",
  description: "",
  duration: "5 menit",
  questions: [""],
  reverseScored: [false],
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AssessmentsPageInner() {
  const [types, setTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewAssessmentType>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeAssessmentTypes((t) => {
      setTypes(t);
      setLoading(false);
    });
    return unsub;
  }, []);

  function openCreate() {
    setEditingSlug(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(a: AssessmentType) {
    setEditingSlug(a.slug);
    setForm({
      slug: a.slug,
      dimension: a.dimension,
      title: a.title,
      description: a.description,
      duration: a.duration,
      questions: [...a.questions],
      reverseScored: a.questions.map((_, i) => a.reverseScored?.[i] ?? false),
    });
    setShowForm(true);
    setError("");
  }

  function updateQuestion(i: number, value: string) {
    const next = [...form.questions];
    next[i] = value;
    setForm({ ...form, questions: next });
  }

  function toggleReverseScored(i: number) {
    const next = form.questions.map((_, idx) => form.reverseScored?.[idx] ?? false);
    next[i] = !next[i];
    setForm({ ...form, reverseScored: next });
  }

  function addQuestion() {
    setForm({
      ...form,
      questions: [...form.questions, ""],
      reverseScored: [...form.questions.map((_, i) => form.reverseScored?.[i] ?? false), false],
    });
  }

  function removeQuestion(i: number) {
    setForm({
      ...form,
      questions: form.questions.filter((_, idx) => idx !== i),
      reverseScored: form.questions
        .map((_, idx) => form.reverseScored?.[idx] ?? false)
        .filter((_, idx) => idx !== i),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanQuestions = form.questions.map((q) => q.trim()).filter(Boolean);
    if (!form.title.trim() || !form.description.trim() || cleanQuestions.length === 0) {
      setError("Judul, deskripsi, dan minimal 1 pertanyaan wajib diisi");
      return;
    }
    // Keep reverseScored aligned to the cleaned (blank-removed) question list.
    const cleanReverseScored = form.questions
      .map((q, i) => ({ q: q.trim(), reverse: form.reverseScored?.[i] ?? false }))
      .filter((item) => item.q)
      .map((item) => item.reverse);

    const slug = editingSlug || slugify(form.title);
    if (!slug) {
      setError("Judul tidak menghasilkan slug yang valid, coba judul lain");
      return;
    }
    // Slugs double as the Firestore doc id — creating with a slug that
    // already exists silently overwrites that assessment (including all its
    // questions). Block that unless we're intentionally editing it.
    if (!editingSlug && types.some((t) => t.slug === slug)) {
      setError(
        `Sudah ada assessment dengan judul yang menghasilkan slug "${slug}". Gunakan judul lain, atau edit assessment yang sudah ada.`
      );
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveAssessmentType({
        ...form,
        slug,
        questions: cleanQuestions,
        reverseScored: cleanReverseScored,
      });
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan assessment");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Hapus assessment ini? Hasil jawaban yang sudah ada tidak akan otomatis terhapus.")) return;
    try {
      await deleteAssessmentType(slug);
    } catch {
      alert("Gagal menghapus assessment");
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
              <h1 className="truncate font-display text-xl font-semibold text-ink">Kelola Assessment</h1>
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
            Assessment yang dibuat di sini langsung muncul di dashboard employee.
          </p>
          <button
            onClick={openCreate}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-soft"
          >
            <Plus size={16} /> Assessment Baru
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">
                {editingSlug ? "Edit Assessment" : "Assessment Baru"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-ink-soft hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Judul (mis. Stress Check)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
              <textarea
                placeholder="Deskripsi singkat"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={form.dimension}
                  onChange={(e) => setForm({ ...form, dimension: e.target.value as Dimension })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                >
                  {DIMENSIONS.map((d) => (
                    <option key={d} value={d}>
                      {dimensionLabels[d]}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Estimasi durasi (mis. 5 menit)"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink">Pertanyaan</label>
                <p className="mb-2 text-xs text-ink-soft">
                  Centang &quot;Positif&quot; kalau kalimatnya positif (setuju = kondisi bagus, mis.
                  &quot;Saya bisa bangkit dengan cepat setelah menghadapi masalah&quot;). Ini penting
                  supaya skor akhir tetap konsisten — tanpa ini, jawaban positif malah bisa
                  terhitung seolah buruk.
                </p>
                <div className="space-y-2">
                  {form.questions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={q}
                        onChange={(e) => updateQuestion(i, e.target.value)}
                        placeholder={`Pertanyaan ${i + 1}`}
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary"
                      />
                      <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-soft">
                        <input
                          type="checkbox"
                          checked={form.reverseScored?.[i] ?? false}
                          onChange={() => toggleReverseScored(i)}
                        />
                        Positif
                      </label>
                      {form.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(i)}
                          className="shrink-0 rounded-lg border border-border p-2.5 text-ink-soft hover:bg-surface-sunk hover:text-danger"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Plus size={14} /> Tambah pertanyaan
                </button>
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editingSlug ? "Simpan Perubahan" : "Buat Assessment"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-ink-soft">Memuat...</p>
        ) : types.length === 0 ? (
          <p className="text-sm text-ink-soft">Belum ada assessment. Klik &quot;Assessment Baru&quot; untuk membuat.</p>
        ) : (
          <div className="space-y-3">
            {types.map((a) => (
              <div
                key={a.slug}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{a.title}</p>
                  <p className="text-sm text-ink-soft">
                    {dimensionLabels[a.dimension]} &middot; {a.duration} &middot; {a.questions.length} pertanyaan
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openEdit(a)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunk"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.slug)}
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

export default function AssessmentsAdminPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.MI_ADMIN]}>
      <AssessmentsPageInner />
    </RoleGuard>
  );
}
