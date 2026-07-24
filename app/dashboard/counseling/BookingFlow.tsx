"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Star } from "lucide-react";
import { useAuthContext } from "@/components/FirebaseProvider";
import {
  subscribePsychologists,
  subscribeMyBookings,
  createBooking,
  cancelBooking,
  submitBookingFeedback,
  getTakenSlots,
  type Psychologist,
  type CounselingBooking,
} from "@/lib/firestore/counseling";
import { Skeleton } from "@/components/Skeleton";

const DAY_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// Builds the next N calendar dates (starting tomorrow) that fall on a day
// the given psychologist is available, based on their weekly pattern.
function upcomingDatesFor(p: Psychologist, count = 6) {
  const availableDays = new Set(p.availability.map((a) => a.dayOfWeek));
  const dates: { iso: string; label: string; dayOfWeek: number }[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  let guard = 0;
  while (dates.length < count && guard < 60) {
    if (availableDays.has(d.getDay())) {
      const iso = d.toISOString().slice(0, 10);
      dates.push({
        iso,
        label: `${d.getDate()} ${MONTH_ID[d.getMonth()]} (${DAY_ID[d.getDay()]})`,
        dayOfWeek: d.getDay(),
      });
    }
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return dates;
}

export function BookingFlow() {
  const { user, profile } = useAuthContext();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [psychLoading, setPsychLoading] = useState(true);
  const [myBookings, setMyBookings] = useState<CounselingBooking[]>([]);

  const [selected, setSelected] = useState<Psychologist | null>(null);
  const [dateIso, setDateIso] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set());
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<{ psychologist: Psychologist; dateLabel: string; time: string } | null>(null);

  useEffect(() => {
    const unsub = subscribePsychologists((p) => {
      setPsychologists(p);
      setPsychLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeMyBookings(user.uid, setMyBookings);
    return unsub;
  }, [user]);

  const dateOptions = selected ? upcomingDatesFor(selected) : [];

  useEffect(() => {
    if (!selected || dateOptions.length === 0) return;
    setSlotsLoading(true);
    getTakenSlots(selected.id, dateOptions.map((d) => d.iso))
      .then(setTakenSlots)
      .catch(() => setTakenSlots(new Set()))
      .finally(() => setSlotsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  async function handleConfirm() {
    if (!selected || !dateIso || !time || !user) return;
    setBooking(true);
    setError("");
    try {
      const dateLabel = dateOptions.find((d) => d.iso === dateIso)?.label || dateIso;
      await createBooking({
        uid: user.uid,
        employeeName: profile?.name || "Karyawan",
        psychologistId: selected.id,
        psychologistName: selected.name,
        date: dateIso,
        dateLabel,
        time,
      });
      setConfirmed({ psychologist: selected, dateLabel, time });
      setSelected(null);
      setDateIso(null);
      setTime(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal membuat booking, coba lagi");
      // Refresh taken slots since the failure was likely a clash.
      if (selected) {
        getTakenSlots(selected.id, dateOptions.map((d) => d.iso)).then(setTakenSlots);
      }
    } finally {
      setBooking(false);
    }
  }

  async function handleCancel(b: CounselingBooking) {
    if (!confirm(`Batalkan sesi dengan ${b.psychologistName} pada ${b.dateLabel}?`)) return;
    try {
      await cancelBooking(b.id, b.psychologistId, b.date, b.time);
    } catch {
      alert("Gagal membatalkan booking");
    }
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto text-success" size={40} />
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">
          Booking Terkonfirmasi
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Sesi dengan {confirmed.psychologist.name} pada {confirmed.dateLabel}, pukul{" "}
          {confirmed.time} WIB.
        </p>
        <button
          onClick={() => setConfirmed(null)}
          className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-soft"
        >
          Booking Sesi Lain
        </button>
      </div>
    );
  }

  const upcomingBookings = myBookings.filter((b) => b.status === "Upcoming");
  const completedBookings = myBookings.filter((b) => b.status === "Completed");

  return (
    <div className="space-y-8">
      {upcomingBookings.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface-sunk p-5">
          <p className="text-sm font-medium text-ink">Sesi mendatang kamu</p>
          <div className="mt-2 space-y-2">
            {upcomingBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3">
                <p className="text-sm text-ink-soft">
                  {b.psychologistName} &middot; {b.dateLabel} &middot; {b.time} WIB
                </p>
                <button
                  onClick={() => handleCancel(b)}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-danger hover:underline"
                >
                  <XCircle size={13} /> Batalkan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedBookings.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-ink">Riwayat sesi selesai</p>
          <div className="mt-3 space-y-4">
            {completedBookings.map((b) => (
              <div key={b.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <p className="text-sm text-ink">
                  {b.psychologistName} &middot; {b.dateLabel} &middot; {b.time} WIB
                </p>
                {b.feedbackRating ? (
                  <p className="mt-1 text-xs text-ink-soft">
                    Feedback kamu: {"★".repeat(b.feedbackRating)}
                    {b.feedbackComment ? ` — ${b.feedbackComment}` : ""}
                  </p>
                ) : (
                  <FeedbackForm bookingId={b.id} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">1. Pilih Psikolog</h2>
        {psychLoading ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : psychologists.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            Belum ada psikolog yang tersedia. Admin bisa menambahkannya di panel Super Admin.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {psychologists.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelected(p);
                  setDateIso(null);
                  setTime(null);
                  setError("");
                }}
                className={`rounded-2xl border p-5 text-left transition-colors ${
                  selected?.id === p.id
                    ? "border-primary bg-surface-sunk"
                    : "border-border bg-surface hover:border-primary/50"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {p.photo}
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{p.name}</p>
                <p className="text-xs text-ink-soft">{p.specialty}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">2. Pilih Tanggal</h2>
          {dateOptions.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              Psikolog ini belum mengatur hari ketersediaan.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2.5">
              {dateOptions.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => {
                    setDateIso(d.iso);
                    setTime(null);
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    dateIso === d.iso
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-ink hover:border-primary/50"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selected && dateIso && (
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">3. Pilih Waktu</h2>
          {slotsLoading ? (
            <div className="mt-4 flex gap-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
            </div>
          ) : (
            (() => {
              const selectedDateOption = dateOptions.find((d) => d.iso === dateIso);
              const dayAvailability = selected.availability.find(
                (a) => a.dayOfWeek === selectedDateOption?.dayOfWeek
              );
              const times = dayAvailability?.times || [];
              return (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {times.map((t) => {
                    const isTaken = takenSlots.has(`${dateIso}_${t}`);
                    return (
                      <button
                        key={t}
                        disabled={isTaken}
                        onClick={() => setTime(t)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          time === t
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-ink hover:border-primary/50"
                        }`}
                      >
                        {t} WIB{isTaken ? " (Penuh)" : ""}
                      </button>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {selected && dateIso && time && (
        <button
          onClick={handleConfirm}
          disabled={booking}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
        >
          {booking ? "Memproses..." : "Konfirmasi Booking"}
        </button>
      )}
    </div>
  );
}

function FeedbackForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (rating === 0) {
      setError("Pilih rating dulu");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await submitBookingFeedback(bookingId, rating, comment.trim());
    } catch {
      setError("Gagal menyimpan feedback, coba lagi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <Star
              size={16}
              className={n <= rating ? "fill-accent text-accent" : "text-border"}
            />
          </button>
        ))}
      </div>
      <textarea
        placeholder="Bagaimana pengalaman sesi kamu? (opsional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-primary"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        onClick={submit}
        disabled={saving}
        className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-soft disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Kirim Feedback"}
      </button>
    </div>
  );
}
