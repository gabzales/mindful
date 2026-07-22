"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
<<<<<<< HEAD
import { ArrowUpRight, Sparkles, Users, Video, BookOpen, Calendar, Megaphone, Target } from "lucide-react";
=======
import { ArrowUpRight } from "lucide-react";
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
import { useAuthContext } from "@/components/FirebaseProvider";
import {
  getRecommendations,
  dimensionLabels,
  learningLibrary,
  levelColor,
  type Dimension,
  type Level,
} from "@/lib/data";
import { getMyLatestResults, type AssessmentResult } from "@/lib/firestore/assessments";
import { subscribeWebinars, subscribeMyRegistrations, type Webinar } from "@/lib/firestore/webinars";
import { subscribeMyBookings, type CounselingBooking } from "@/lib/firestore/counseling";
import { subscribeMyLearningProgress, type LearningProgressMap } from "@/lib/firestore/learning";
import { WaveGauge } from "@/components/WaveGauge";
import { Skeleton } from "@/components/Skeleton";

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 4) return "Selamat malam";
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function DashboardHome() {
  const { user, profile } = useAuthContext();
  const firstName = profile?.name?.split(" ")[0] || "Andi";
  const greeting = timeOfDayGreeting();

  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [allWebinars, setAllWebinars] = useState<Webinar[]>([]);
  const [myRegs, setMyRegs] = useState<Set<string>>(new Set());
  const [myBookings, setMyBookings] = useState<CounselingBooking[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgressMap>({});

  useEffect(() => {
    if (!user) return;
    getMyLatestResults(user.uid)
      .then(setResults)
      .catch(() => {})
      .finally(() => setResultsLoading(false));
  }, [user]);

  useEffect(() => {
    const unsub = subscribeWebinars(setAllWebinars);
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeMyRegistrations(user.uid, setMyRegs);
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeMyBookings(user.uid, setMyBookings);
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeMyLearningProgress(user.uid, setLearningProgress);
    return unsub;
  }, [user]);

  const upcomingWebinars = allWebinars.filter((w) => myRegs.has(w.id));
  const upcomingBookings = myBookings.filter((b) => b.status === "Upcoming");
  const inProgressLearning = learningLibrary
    .map((l) => ({ ...l, progress: learningProgress[l.id] ?? 0 }))
    .filter((l) => l.progress > 0 && l.progress < 100);
  const stressResult = results.find((r) => r.dimension === "stress");
  const recommendations = getRecommendations(
    results.map((r) => ({ dimension: r.dimension as Dimension, level: r.level as Level }))
  );

  return (
<<<<<<< HEAD
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Clean, Typographic Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Portal Kesejahteraan Karyawan
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-2">
            {greeting}, <span className="text-primary-soft">{firstName}</span>
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Mari pantau kondisi mental Anda hari ini dan luangkan waktu sejenak untuk beristirahat.
          </p>
        </div>
        
        <div className="shrink-0 flex items-center gap-3">
          {/* Quick Info Badge 1 */}
          <div className="rounded-xl border border-border bg-white px-4 py-2 shadow-xs">
            <p className="text-[9px] font-bold uppercase tracking-wider text-ink-soft">Hari Ini</p>
            <p className="text-xs sm:text-sm font-semibold text-ink mt-0.5">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "short"
              })}
            </p>
          </div>
          
          {/* Quick Info Badge 2 */}
          <div className="rounded-xl border border-border bg-white px-4 py-2 shadow-xs">
            <p className="text-[9px] font-bold uppercase tracking-wider text-ink-soft">Progres Assessment</p>
            <p className="text-xs sm:text-sm font-semibold text-primary mt-0.5">
              {results.length > 0 ? `${results.length} Dimensi` : "Belum Mulai"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Pulse & Recommendations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Wellbeing Pulse Card */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-surface p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Wellbeing Pulse Minggu Ini
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">Metrik kesehatan psikologis harian Anda.</p>
            </div>
=======
    <div className="space-y-10">
      <div>
        <p className="text-sm text-ink-soft">{greeting},</p>
        <h1 className="font-display text-3xl font-semibold text-ink">
          {firstName}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">
              Wellbeing Pulse Minggu Ini
            </h2>
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
            {stressResult && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${levelColor(
                  stressResult.level
                )}`}
              >
                Stress: {stressResult.level}
              </span>
            )}
          </div>
          {resultsLoading ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
<<<<<<< HEAD
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface-sunk/30">
              <p className="text-sm font-medium text-ink">
                Anda belum mengisi assessment apapun.
              </p>
              <p className="text-xs text-ink-soft mt-1">
                Lakukan pengisian assessment awal untuk memetakan wellbeing pulse Anda.
              </p>
              <Link
                href="/dashboard/assessment"
                className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-soft transition-colors"
              >
                Mulai Assessment Pertamamu →
=======
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-ink-soft">
                Kamu belum mengisi assessment apapun.
              </p>
              <Link
                href="/dashboard/assessment"
                className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                Mulai assessment pertamamu →
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {results.map((r) => (
                <WaveGauge
                  key={r.dimension}
                  label={dimensionLabels[r.dimension as Dimension] || r.title}
                  level={r.level as Level}
                  score={r.score}
                />
              ))}
            </div>
          )}
        </div>

<<<<<<< HEAD
        {/* Clean, Modern Recommendations Card */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-ink">Rekomendasi</h2>
                <p className="text-xs text-ink-soft">
                  {results.length > 0
                    ? "Rekomendasi tindakan terpersonalisasi."
                    : "Isi assessment untuk mendapat rekomendasi."}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {recommendations.map((r) => {
                const isCounseling = r.href.includes("counseling");
                const isLearning = r.href.includes("learning");
                const isAssessment = r.href.includes("assessment");
                const typeLabel = isCounseling
                  ? "Konseling"
                  : isLearning
                  ? "Self-Study"
                  : isAssessment
                  ? "Assessment"
                  : "Webinar";

                return (
                  <Link
                    key={r.id}
                    href={r.href}
                    className="group block rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="inline-block rounded-full bg-surface-sunk px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-soft">
                          {typeLabel}
                        </span>
                        <p className="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                          {r.title}
                        </p>
                        <p className="text-xs text-ink-soft leading-relaxed">
                          {r.reason}
                        </p>
                      </div>
                      <ArrowUpRight size={15} className="text-ink-soft group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <Link
              href="/dashboard/assessment"
              className="flex items-center justify-center gap-1.5 w-full rounded-2xl bg-[#2A093D] py-3 text-xs font-semibold text-white shadow-xs hover:bg-[#3d1254] transition-colors"
            >
              <span>Ulangi Assessment</span>
              <ArrowUpRight size={14} />
            </Link>
=======
        <div className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground">
          <h2 className="font-display text-lg font-semibold">Rekomendasi</h2>
          <p className="mt-1 text-sm text-primary-foreground/70">
            {results.length > 0
              ? "Disusun dari hasil assessment terbaru kamu."
              : "Isi assessment untuk mendapat rekomendasi yang sesuai."}
          </p>
          <div className="mt-5 space-y-3">
            {recommendations.map((r) => (
              <Link
                key={r.id}
                href={r.href}
                className="block rounded-xl bg-primary-foreground/10 p-3.5 transition-colors hover:bg-primary-foreground/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="mt-0.5 text-xs text-primary-foreground/70">
                      {r.reason}
                    </p>
                  </div>
                  <ArrowUpRight size={16} className="mt-0.5 shrink-0" />
                </div>
              </Link>
            ))}
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Bottom Row Grid: Counseling, Webinars, and Progress */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Counseling Card */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/5 text-success">
                <Users size={18} />
              </div>
              <h3 className="font-display text-base font-bold text-ink">
                Konseling Mendatang
              </h3>
            </div>
            
            {upcomingBookings.length === 0 ? (
              <div className="mt-8 flex flex-col items-center text-center p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-sunk text-ink-soft mb-3">
                  <Calendar size={20} />
                </div>
                <p className="text-xs font-bold text-ink">Belum Ada Jadwal</p>
                <p className="text-[11px] text-ink-soft mt-1 leading-normal max-w-[180px] mx-auto">
                  Butuh ruang bercerita? Jadwalkan sesi konseling pribadi gratis dengan psikolog.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {upcomingBookings.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-border bg-surface p-3.5 transition-all hover:border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                        {b.psychologistName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-ink">
                          {b.psychologistName}
                        </p>
                        <p className="text-[10px] text-ink-soft mt-0.5">
                          {b.dateLabel} · {b.time} WIB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-6 border-t border-border pt-4">
            <Link
              href="/dashboard/counseling"
              className="flex items-center justify-center w-full rounded-2xl border border-border bg-surface py-3 text-xs font-semibold text-ink hover:bg-surface-sunk transition-colors"
            >
              Jadwalkan Konseling →
            </Link>
          </div>
        </div>

        {/* Webinar Card */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/5 text-amber-500">
                <Video size={18} />
              </div>
              <h3 className="font-display text-base font-bold text-ink">
                Webinar Terdaftar
              </h3>
            </div>
            
            {upcomingWebinars.length === 0 ? (
              <div className="mt-8 flex flex-col items-center text-center p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-sunk text-ink-soft mb-3">
                  <Megaphone size={20} />
                </div>
                <p className="text-xs font-bold text-ink">Belum Ada Registrasi</p>
                <p className="text-[11px] text-ink-soft mt-1 leading-normal max-w-[180px] mx-auto">
                  Ikuti sesi webinar informatif bertema kesehatan mental dan manajemen stres kerja.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {upcomingWebinars.map((w) => {
                  const parts = w.date.split(" ");
                  const day = parts[0] || "12";
                  const month = parts[1] ? parts[1].substring(0, 3) : "Jul";

                  return (
                    <div key={w.id} className="flex gap-3 items-center rounded-2xl border border-border bg-surface p-3 transition-all hover:border-primary/20">
                      {/* Mini Calendar Event Sheet */}
                      <div className="flex flex-col items-center justify-center h-11 w-11 rounded-xl bg-primary/5 border border-primary/10 text-center shrink-0">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-primary">{month}</span>
                        <span className="text-base font-black text-ink leading-tight -mt-0.5">{day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-ink">
                          {w.title}
                        </p>
                        <p className="text-[10px] text-ink-soft mt-0.5 truncate">
                          {w.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="mt-6 border-t border-border pt-4">
            <Link
              href="/dashboard/webinar"
              className="flex items-center justify-center w-full rounded-2xl border border-border bg-surface py-3 text-xs font-semibold text-ink hover:bg-surface-sunk transition-colors"
            >
              Cari Webinar Baru →
            </Link>
          </div>
        </div>

        {/* Learning Progress Card */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/5 text-purple-500">
                <BookOpen size={18} />
              </div>
              <h3 className="font-display text-base font-bold text-ink">
                Progres Belajar
              </h3>
            </div>
            
            {inProgressLearning.length === 0 ? (
              <div className="mt-8 flex flex-col items-center text-center p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-sunk text-ink-soft mb-3">
                  <Target size={20} />
                </div>
                <p className="text-xs font-bold text-ink">Belum Ada Progres</p>
                <p className="text-[11px] text-ink-soft mt-1 leading-normal max-w-[180px] mx-auto">
                  Mulai perjalanan belajarmu dengan mendengarkan audio relaksasi atau membaca artikel.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {inProgressLearning.map((l) => (
                  <div key={l.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-bold text-ink">{l.title}</p>
                      <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                        {l.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunk">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${l.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-6 border-t border-border pt-4">
            <Link
              href="/dashboard/learning"
              className="flex items-center justify-center w-full rounded-2xl border border-border bg-surface py-3 text-xs font-semibold text-ink hover:bg-surface-sunk transition-colors"
            >
              Buka Learning Center →
            </Link>
          </div>
=======
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-display text-base font-semibold text-ink">
            Konseling Mendatang
          </h3>
          {upcomingBookings.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              Belum ada jadwal konseling.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {upcomingBookings.map((b) => (
                <div key={b.id} className="rounded-lg bg-surface-sunk p-3">
                  <p className="text-sm font-medium text-ink">{b.psychologistName}</p>
                  <p className="text-xs text-ink-soft">
                    {b.dateLabel} · {b.time} WIB
                  </p>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/counseling"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Booking sesi baru →
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-display text-base font-semibold text-ink">
            Webinar Terdaftar
          </h3>
          {upcomingWebinars.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Belum ada webinar terdaftar.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {upcomingWebinars.map((w) => (
                <div key={w.id} className="rounded-lg bg-surface-sunk p-3">
                  <p className="text-sm font-medium text-ink">{w.title}</p>
                  <p className="text-xs text-ink-soft">
                    {w.date} · {w.time}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/webinar"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Lihat semua webinar →
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-display text-base font-semibold text-ink">
            Learning Progress
          </h3>
          {inProgressLearning.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Belum ada progres belajar.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {inProgressLearning.map((l) => (
                <div key={l.id}>
                  <p className="text-sm font-medium text-ink">{l.title}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunk">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${l.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/learning"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Buka Learning Center →
          </Link>
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
        </div>
      </div>
    </div>
  );
}
