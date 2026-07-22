"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Users,
  MessageCircle,
  CalendarDays,
  ClipboardList,
  Stethoscope,
  Activity,
} from "lucide-react";
import {
  getPlatformStats,
  getRecentAssessments,
  type PlatformStats,
  type RecentAssessment,
} from "@/lib/firestore/analytics";
import { levelColor } from "@/lib/data";
import { Skeleton } from "@/components/Skeleton";

const LEVEL_LABEL: Record<string, string> = { High: "Tinggi", Medium: "Sedang", Low: "Rendah" };

function formatDate(value: unknown): string {
  if (!value) return "-";
  const asDate =
    typeof value === "object" && value !== null && "toDate" in value
      ? (value as { toDate: () => Date }).toDate()
      : new Date(value as string);
  if (isNaN(asDate.getTime())) return "-";
  return asDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function MiAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recent, setRecent] = useState<RecentAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlatformStats(), getRecentAssessments(6)])
      .then(([s, r]) => {
        setStats(s);
        setRecent(r);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: Building2, label: "Companies", value: stats?.totalCompanies ?? 0 },
    { icon: Users, label: "Users", value: (stats?.totalUsers ?? 0).toLocaleString("id-ID") },
    { icon: MessageCircle, label: "Counseling Sessions", value: stats?.totalCounselingSessions ?? 0 },
    { icon: CalendarDays, label: "Webinars", value: stats?.totalWebinars ?? 0 },
    {
      icon: ClipboardList,
      label: "Assessments Completed",
      value: (stats?.totalAssessmentsCompleted ?? 0).toLocaleString("id-ID"),
    },
    { icon: Stethoscope, label: "Psychologists", value: stats?.totalPsychologists ?? 0 },
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
                Administrator MI
              </p>
              <h1 className="truncate font-display text-xl font-semibold text-ink">
                Platform Overview
              </h1>
            </div>
          </div>
          <Link href="/" className="shrink-0 text-sm font-medium text-ink-soft hover:text-ink">
            Keluar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {statCards.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-surface p-5">
                <s.icon className="text-primary" size={18} />
                <p className="mt-3 font-display text-2xl font-semibold text-ink">
                  {s.value}
                </p>
                <p className="text-xs text-ink-soft">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            <Activity className="mr-2 inline-block text-primary" size={18} />
            Aktivitas Assessment Terbaru
          </h2>
          {loading ? (
            <div className="mt-4 space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Belum ada aktivitas assessment.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {recent.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg bg-surface-sunk px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {a.userName} &middot; {a.title}
                    </p>
                    <p className="text-xs text-ink-soft">{formatDate(a.createdAt)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelColor(
                      a.level
                    )}`}
                  >
                    {LEVEL_LABEL[a.level] || a.level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Trainings &amp; Invoices
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Statistik ini memerlukan modul Training dan sistem Invoice yang
            belum dibangun — akan ditambahkan setelah fitur tersebut ada,
            supaya angkanya benar-benar berasal dari data nyata dan bukan
            placeholder.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/hr"
            className="rounded-2xl border border-border bg-surface p-5 text-sm font-medium text-ink hover:border-primary/50"
          >
            Lihat contoh HR Dashboard →
          </Link>
          <Link
            href="/admedika"
            className="rounded-2xl border border-border bg-surface p-5 text-sm font-medium text-ink hover:border-primary/50"
          >
            Lihat AdMedika Dashboard →
          </Link>
        </div>
      </main>
    </div>
  );
}
