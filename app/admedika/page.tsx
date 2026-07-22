"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import { getPlatformStats, type PlatformStats } from "@/lib/firestore/analytics";
import { downloadPlatformReportPdf } from "@/lib/pdf/adminReport";
import { Skeleton } from "@/components/Skeleton";

export default function AdMedikaDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

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
                AdMedika Partner View
              </p>
              <h1 className="truncate font-display text-xl font-semibold text-ink">
                Client Utilization Report
              </h1>
            </div>
          </div>
          <Link href="/" className="shrink-0 text-sm font-medium text-ink-soft hover:text-ink">
            Keluar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            Data agregat platform — tidak menampilkan data individu karyawan.
          </p>
          <button
            onClick={() =>
              stats && downloadPlatformReportPdf(stats, "AdMedika Utilization Report")
            }
            disabled={!stats}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-ink hover:bg-surface-sunk disabled:opacity-50"
          >
            <Download size={15} /> Download Report
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatBox label="Total Employees" value={stats?.totalEmployees ?? 0} />
            <StatBox
              label="Assessment Completion"
              value={`${stats?.assessmentCompletionRate ?? 0}%`}
            />
            <StatBox
              label="Assessment Selesai"
              value={stats?.totalAssessmentsCompleted ?? 0}
            />
            <StatBox
              label="Registrasi Webinar"
              value={stats?.totalWebinarRegistrations ?? 0}
            />
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Karyawan per Department
          </h2>
          {loading ? (
            <div className="mt-4 space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !stats || stats.departmentBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              Belum ada data department yang tercatat.
            </p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {stats.departmentBreakdown.map((d) => (
                <div
                  key={d.department}
                  className="flex items-center justify-between rounded-lg bg-surface-sunk px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-ink">{d.department}</span>
                  <span className="text-sm text-ink-soft">{d.count} orang</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Client List, Counseling Usage &amp; Training Usage
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Statistik ini memerlukan fitur Multi Company, booking konseling, dan
            training program yang belum aktif — akan ditambahkan setelah fitur
            tersebut dibangun.
          </p>
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}
