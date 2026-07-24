"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, ClipboardCheck, Building2 } from "lucide-react";
import { getPlatformStats, type PlatformStats } from "@/lib/firestore/analytics";
import { useAuthContext } from "@/components/FirebaseProvider";
import { Skeleton } from "@/components/Skeleton";

export default function HrDashboard() {
  const { profile } = useAuthContext();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Scoped to this HR user's own company — HR must never see aggregate
  // numbers from other client companies (multi-tenant isolation).
  useEffect(() => {
    getPlatformStats(profile?.company)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [profile?.company]);

  const totalStressResponses = stats
    ? stats.stressDistribution.high + stats.stressDistribution.medium + stats.stressDistribution.low
    : 0;

  function pct(n: number) {
    return totalStressResponses > 0 ? Math.round((n / totalStressResponses) * 100) : 0;
  }

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
                HR Dashboard
              </p>
              <h1 className="truncate font-display text-xl font-semibold text-ink">
                Company Wellbeing Dashboard
              </h1>
            </div>
          </div>
          <nav className="flex shrink-0 items-center gap-4">
            <Link href="/hr/employees" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:inline">
              Karyawan
            </Link>
            <Link href="/hr/settings" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:inline">
              Settings
            </Link>
            <Link href="/" className="text-sm font-medium text-ink-soft hover:text-ink">
              Keluar
            </Link>
          </nav>
        </div>
        <nav className="mt-4 flex items-center gap-4 overflow-x-auto sm:hidden">
          <Link href="/hr/employees" className="shrink-0 rounded-lg bg-surface-sunk px-3 py-1.5 text-xs font-medium text-ink">
            Karyawan
          </Link>
          <Link href="/hr/settings" className="shrink-0 rounded-lg bg-surface-sunk px-3 py-1.5 text-xs font-medium text-ink">
            Settings
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-8">
        <p className="text-sm text-ink-soft">
          Data yang ditampilkan bersifat agregat — tidak menampilkan data individu
          karyawan.
        </p>
        {!loading && !profile?.company && (
          <p className="rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
            Perusahaan belum diset di profil kamu, jadi statistik di bawah belum bisa
            dipersempit ke perusahaan kamu. Lengkapi field &quot;Perusahaan&quot; di halaman
            Pengaturan Profil.
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <Users className="text-primary" size={20} />
              <p className="mt-3 font-display text-3xl font-semibold text-ink">
                {stats?.totalEmployees ?? 0}
              </p>
              <p className="text-sm text-ink-soft">Total Karyawan Terdaftar</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6">
              <ClipboardCheck className="text-primary" size={20} />
              <p className="mt-3 font-display text-3xl font-semibold text-ink">
                {stats?.assessmentCompletionRate ?? 0}%
              </p>
              <p className="text-sm text-ink-soft">
                Karyawan Sudah Mengisi Assessment
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6">
              <Building2 className="text-primary" size={20} />
              <p className="mt-3 font-display text-3xl font-semibold text-ink">
                {stats?.departmentBreakdown.length ?? 0}
              </p>
              <p className="text-sm text-ink-soft">Department Aktif</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">
              Distribusi Tingkat Stress
            </h2>
            {loading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : totalStressResponses === 0 ? (
              <p className="mt-5 text-sm text-ink-soft">
                Belum ada karyawan yang mengisi assessment Stress Check.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                <DistributionBar
                  label="High"
                  value={pct(stats!.stressDistribution.high)}
                  color="bg-danger"
                />
                <DistributionBar
                  label="Medium"
                  value={pct(stats!.stressDistribution.medium)}
                  color="bg-warning"
                />
                <DistributionBar
                  label="Low"
                  value={pct(stats!.stressDistribution.low)}
                  color="bg-success"
                />
              </div>
            )}
          </div>

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
                Belum ada data department (karyawan belum mengisi biodata).
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
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-surface p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Layanan Paling Diminati &amp; Risiko per Department
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Statistik ini akan tersedia setelah fitur booking konseling aktif — saat
            ini datanya belum bisa dihitung karena belum ada riwayat booking nyata.
          </p>
        </div>
      </main>
    </div>
  );
}

function DistributionBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono text-ink-soft">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunk">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
