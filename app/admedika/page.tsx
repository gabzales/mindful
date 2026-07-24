"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Building2 } from "lucide-react";
import { getPlatformStats, getCompanyBreakdown, type PlatformStats, type CompanyBreakdownRow } from "@/lib/firestore/analytics";
import { downloadPlatformReportPdf } from "@/lib/pdf/adminReport";
import { Skeleton } from "@/components/Skeleton";

export default function AdMedikaDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [companies, setCompanies] = useState<CompanyBreakdownRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  useEffect(() => {
    getPlatformStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
    getCompanyBreakdown()
      .then(setCompanies)
      .catch(() => setCompanies([]))
      .finally(() => setCompaniesLoading(false));
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

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            <Building2 className="mr-2 inline-block text-primary" size={18} />
            Client List
          </h2>
          {companiesLoading ? (
            <div className="mt-4 space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              Belum ada perusahaan dengan karyawan terdaftar.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-soft">
                    <th className="py-2 pr-4 font-medium">Perusahaan</th>
                    <th className="py-2 pr-4 font-medium">Karyawan</th>
                    <th className="py-2 pr-4 font-medium">Assessment Completion</th>
                    <th className="py-2 pr-4 font-medium">Sesi Konseling</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.name} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-ink">
                        {c.name}
                        {c.employeeQuota ? (
                          <span className="ml-1.5 text-xs font-normal text-ink-soft">/ kuota {c.employeeQuota}</span>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-4 text-ink-soft">{c.employeeCount}</td>
                      <td className="py-2.5 pr-4 text-ink-soft">{c.assessmentCompletionRate}%</td>
                      <td className="py-2.5 pr-4 text-ink-soft">{c.counselingSessions}</td>
                      <td className="py-2.5 pr-4">
                        {c.status ? (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.status === "active" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                            {c.status === "active" ? "Aktif" : "Tidak Aktif"}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-soft">Belum terdaftar di Companies</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Training Usage
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Statistik ini memerlukan modul Training program yang belum dibangun —
            akan ditambahkan setelah fitur tersebut ada. Client List dan Counseling
            Usage di atas sudah memakai data asli.
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
