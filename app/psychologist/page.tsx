"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Users, Star, MessageCircle, ThumbsUp, CheckCircle2, Pencil, X } from "lucide-react";
import { useAuthContext } from "@/components/FirebaseProvider";
import {
  subscribePsychologists,
  subscribeBookingsForPsychologist,
  markBookingCompleted,
  updatePsychologist,
  type Psychologist,
  type CounselingBooking,
  type WeeklyAvailability,
} from "@/lib/firestore/counseling";
import { Skeleton } from "@/components/Skeleton";

const DAYS = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
];

export default function PsychologistDashboard() {
  const { user } = useAuthContext();
  const [allPsychologists, setAllPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<CounselingBooking[]>([]);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState<WeeklyAvailability[]>([]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  useEffect(() => {
    const unsub = subscribePsychologists((list) => {
      setAllPsychologists(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const myProfile = allPsychologists.find((p) => p.linkedUid === user?.uid) || null;

  useEffect(() => {
    if (!myProfile) return;
    const unsub = subscribeBookingsForPsychologist(myProfile.id, setBookings);
    return unsub;
  }, [myProfile?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
          <h1 className="font-display text-lg font-semibold text-ink">
            Akun Belum Tertaut
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Akun kamu belum ditautkan ke profil psikolog manapun. Hubungi Super Admin untuk
            menautkan akun kamu di panel Kelola Psikolog.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-soft"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  function openScheduleEdit() {
    setScheduleDraft(myProfile?.availability ? JSON.parse(JSON.stringify(myProfile.availability)) : []);
    setScheduleError("");
    setEditingSchedule(true);
  }

  function toggleDay(dayOfWeek: number) {
    const exists = scheduleDraft.find((a) => a.dayOfWeek === dayOfWeek);
    if (exists) {
      setScheduleDraft(scheduleDraft.filter((a) => a.dayOfWeek !== dayOfWeek));
    } else {
      setScheduleDraft([...scheduleDraft, { dayOfWeek, times: ["09.00", "13.00"] }]);
    }
  }

  function updateDayTimes(dayOfWeek: number, timesStr: string) {
    const times = timesStr.split(",").map((t) => t.trim()).filter(Boolean);
    setScheduleDraft(scheduleDraft.map((a) => (a.dayOfWeek === dayOfWeek ? { ...a, times } : a)));
  }

  async function saveSchedule() {
    if (!myProfile) return;
    if (scheduleDraft.length === 0) {
      setScheduleError("Pilih minimal 1 hari ketersediaan");
      return;
    }
    setSavingSchedule(true);
    setScheduleError("");
    try {
      // This only ever writes the `availability` field — matches the
      // firestore.rules update rule that lets a linked psychologist self-edit
      // just that one field on their own profile (name/specialty/linkedUid
      // stay admin-only).
      await updatePsychologist(myProfile.id, { availability: scheduleDraft });
      setEditingSchedule(false);
    } catch (e: unknown) {
      setScheduleError(e instanceof Error ? e.message : "Gagal menyimpan jadwal");
    } finally {
      setSavingSchedule(false);
    }
  }

  function dayLabel(a: WeeklyAvailability) {
    return DAYS.find((d) => d.value === a.dayOfWeek)?.label || "";
  }

  const upcoming = bookings.filter((b) => b.status === "Upcoming");
  const completed = bookings.filter((b) => b.status === "Completed");
  const feedbacks = completed.filter((b) => b.feedbackComment);
  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + (f.feedbackRating || 0), 0) / feedbacks.length).toFixed(1)
      : "-";

  const uniqueClients = new Set(bookings.map((b) => b.uid)).size;

  const stats = [
    { icon: Users, label: "Total Klien", value: uniqueClients },
    { icon: CalendarDays, label: "Sesi Selesai", value: completed.length },
    { icon: Star, label: "Rating Rata-rata", value: avgRating },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Image
              src="/mindfulness-logo.png"
              alt="Mindfulness Indonesia"
              width={120}
              height={30}
              className="hidden shrink-0 sm:block"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-ink-soft">
                Psikolog Dashboard
              </p>
              <h1 className="truncate font-display text-xl font-semibold text-ink">
                {myProfile.name}
              </h1>
              <p className="text-xs text-ink-soft">{myProfile.specialty}</p>
            </div>
          </div>
          <Link href="/" className="shrink-0 text-sm font-medium text-ink-soft hover:text-ink">
            Keluar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-surface p-6">
              <s.icon className="text-primary" size={20} />
              <p className="mt-3 font-display text-3xl font-semibold text-ink">
                {s.value}
              </p>
              <p className="text-sm text-ink-soft">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">
              <CalendarDays className="mr-2 inline-block text-primary" size={18} />
              Jadwal Ketersediaan Saya
            </h2>
            {!editingSchedule && (
              <button
                onClick={openScheduleEdit}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-sunk"
              >
                <Pencil size={13} /> Edit
              </button>
            )}
          </div>

          {!editingSchedule ? (
            myProfile.availability.length === 0 ? (
              <p className="mt-4 text-sm text-ink-soft">
                Belum ada hari tersedia diatur. Klik &quot;Edit&quot; untuk mengatur jadwalmu.
              </p>
            ) : (
              <div className="mt-4 space-y-1.5">
                {myProfile.availability.map((a) => (
                  <p key={a.dayOfWeek} className="text-sm text-ink">
                    <span className="font-medium">{dayLabel(a)}</span>{" "}
                    <span className="text-ink-soft">{a.times.join(", ")}</span>
                  </p>
                ))}
              </div>
            )
          ) : (
            <div className="mt-4 space-y-3">
              {DAYS.map((d) => {
                const a = scheduleDraft.find((x) => x.dayOfWeek === d.value);
                return (
                  <div key={d.value} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`w-24 shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        a ? "border-primary bg-surface-sunk text-ink" : "border-border text-ink-soft hover:bg-surface-sunk"
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
              {scheduleError && <p className="text-sm text-danger">{scheduleError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={saveSchedule}
                  disabled={savingSchedule}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
                >
                  {savingSchedule ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
                <button
                  onClick={() => setEditingSchedule(false)}
                  className="flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-sunk"
                >
                  <X size={14} /> Batal
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            <CalendarDays className="mr-2 inline-block text-primary" size={18} />
            Jadwal Sesi Mendatang
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Belum ada sesi mendatang.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {upcoming.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-surface-sunk px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{s.employeeName}</p>
                    <p className="text-xs text-ink-soft">
                      {s.dateLabel} &middot; {s.time} WIB
                    </p>
                  </div>
                  <button
                    onClick={() => markBookingCompleted(s.id)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
                  >
                    <CheckCircle2 size={13} /> Tandai Selesai
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            <MessageCircle className="mr-2 inline-block text-primary" size={18} />
            Umpan Balik Terbaru
          </h2>
          {feedbacks.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Belum ada umpan balik dari klien.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {feedbacks.slice(0, 5).map((f) => (
                <div key={f.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink">{f.employeeName}</p>
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={12} className="text-success" />
                      <span className="text-xs font-medium text-ink-soft">
                        {f.feedbackRating}/5
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{f.feedbackComment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
