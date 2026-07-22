"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  ClipboardList,
  CalendarDays,
  ClipboardCheck,
  Download,
  Activity,
} from "lucide-react";
import { getPlatformStats, getRecentAssessments, type PlatformStats, type RecentAssessment } from "@/lib/firestore/analytics";
import { downloadPlatformReportPdf } from "@/lib/pdf/adminReport";
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

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recent, setRecent] = useState<RecentAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlatformStats(), getRecentAssessments(8)])
      .then(([s, r]) => {
        setStats(s);
        setRecent(r);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0 },
    { icon: Users, label: "Karyawan", value: stats?.totalEmployees ?? 0 },
    { icon: ClipboardList, label: "Assessment Selesai", value: stats?.totalAssessmentsCompleted ?? 0 },
    { icon: ClipboardCheck, label: "Completion Rate", value: `${stats?.assessmentCompletionRate ?? 0}%` },
    { icon: CalendarDays, label: "Webinar Aktif", value: stats?.totalWebinars ?? 0 },
    { icon: CalendarDays, label: "Registrasi Webinar", value: stats?.totalWebinarRegistrations ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-4 py-5 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
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
                  Super Admin
                </p>
                <h1 className="truncate font-display text-xl font-semibold text-ink">
                  Platform Overview
                </h1>
              </div>
            </div>
            <nav className="flex shrink-0 items-center gap-4">
              <Link href="/super-admin/assessments" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:inline">
                Assessment
              </Link>
              <Link href="/super-admin/webinars" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:inline">
                Webinar
              </Link>
              <Link href="/super-admin/psychologists" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:inline">
                Psikolog
              </Link>
              <Link href="/super-admin/settings" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:inline">
                Settings
              </Link>
              <Link href="/" className="text-sm font-medium text-ink-soft hover:text-ink">
                Keluar
              </Link>
            </nav>
          </div>
          <nav className="mt-4 flex items-center gap-4 overflow-x-auto sm:hidden">
            <Link href="/super-admin/assessments" className="shrink-0 rounded-lg bg-surface-sunk px-3 py-1.5 text-xs font-medium text-ink">
              Assessment
            </Link>
            <Link href="/super-admin/webinars" className="shrink-0 rounded-lg bg-surface-sunk px-3 py-1.5 text-xs font-medium text-ink">
              Webinar
            </Link>
            <Link href="/super-admin/psychologists" className="shrink-0 rounded-lg bg-surface-sunk px-3 py-1.5 text-xs font-medium text-ink">
              Psikolog
            </Link>
            <Link href="/super-admin/settings" className="shrink-0 rounded-lg bg-surface-sunk px-3 py-1.5 text-xs font-medium text-ink">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-8">
        <div className="flex items-center justify-end">
          <button
            onClick={() => stats && downloadPlatformReportPdf(stats, "Super Admin Platform Report")}
            disabled={!stats}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-ink hover:bg-surface-sunk disabled:opacity-50"
          >
            <Download size={15} /> Download Report
          </button>
        </div>

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
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg bg-surface-sunk px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {r.userName} &middot; {r.title}
                    </p>
                    <p className="text-xs text-ink-soft">{formatDate(r.createdAt)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelColor(
                      r.level
                    )}`}
                  >
                    {LEVEL_LABEL[r.level] || r.level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Companies, Psikolog, Sesi Konseling &amp; Revenue
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Statistik ini memerlukan fitur Multi Company, manajemen psikolog,
            booking konseling, dan sistem invoice yang belum aktif — akan
            ditambahkan setelah fitur tersebut dibangun.
          </p>
        </div>
      </main>
    </div>
  );
}
