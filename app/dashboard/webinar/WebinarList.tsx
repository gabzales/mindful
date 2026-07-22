"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Users, CheckCircle2, Video } from "lucide-react";
import {
  subscribeWebinars,
  subscribeMyRegistrations,
  registerForWebinar,
  unregisterFromWebinar,
  type Webinar,
} from "@/lib/firestore/webinars";
import { useAuthContext } from "@/components/FirebaseProvider";
import { Skeleton } from "@/components/Skeleton";

export function WebinarList() {
  const { user } = useAuthContext();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [myRegs, setMyRegs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeWebinars((w) => {
      setWebinars(w);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeMyRegistrations(user.uid, setMyRegs);
    return unsub;
  }, [user]);

  async function toggleRegister(id: string) {
    if (!user) return;
    setPendingId(id);
    setErrorId(null);
    setError("");
    try {
      if (myRegs.has(id)) {
        await unregisterFromWebinar(user.uid, id);
      } else {
        await registerForWebinar(user.uid, id);
      }
    } catch (e: unknown) {
      setErrorId(id);
      setError(e instanceof Error ? e.message : "Gagal memproses pendaftaran, coba lagi");
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (webinars.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
        <p className="text-sm text-ink-soft">
          Belum ada webinar yang tersedia. Admin bisa menambahkannya di panel Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {webinars.map((w) => {
        const registered = myRegs.has(w.id);
        const full = w.seatsLeft <= 0;
        const isPending = pendingId === w.id;
        return (
          <div
            key={w.id}
            className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6"
          >
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                {w.title}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">oleh {w.speaker}</p>
              <div className="mt-4 space-y-1.5 text-sm text-ink-soft">
                <p className="flex items-center gap-2">
                  <CalendarDays size={15} /> {w.date} &middot; {w.time}
                </p>
                <p className="flex items-center gap-2">
                  <Users size={15} /> {w.seatsLeft} kursi tersisa
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleRegister(w.id)}
              disabled={(!registered && full) || isPending}
              className={`mt-5 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                registered
                  ? "bg-success-soft text-success"
                  : full
                  ? "bg-surface-sunk text-ink-soft cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary-soft"
              }`}
            >
              {registered && <CheckCircle2 size={16} />}
              {isPending
                ? "Memproses..."
                : registered
                ? "Terdaftar"
                : full
                ? "Kursi Penuh"
                : "Daftar Sekarang"}
            </button>
            {registered && w.zoomLink && (
              <a
                href={w.zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-primary/40 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                <Video size={16} /> Join Meeting
              </a>
            )}
            {registered && !w.zoomLink && (
              <p className="mt-2 text-center text-xs text-ink-soft">
                Link meeting akan muncul di sini mendekati jadwal webinar.
              </p>
            )}
            {errorId === w.id && error && (
              <p className="mt-2 text-center text-xs text-danger">{error}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
