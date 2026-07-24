"use client";

import { useEffect, useState } from "react";
import { Download, Printer, FileText } from "lucide-react";
import { useAuthContext } from "@/components/FirebaseProvider";
import { subscribeMyAllResults, type AssessmentResult } from "@/lib/firestore/assessments";
import { downloadAssessmentResultPdf } from "@/lib/pdf/assessmentReport";
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
  return asDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function ReportsPage() {
  const { user, profile } = useAuthContext();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeMyAllResults(user.uid, (r) => {
      setResults(r);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Laporan Saya</h1>
          <p className="mt-1 text-ink-soft">
            Riwayat hasil assessment kamu. Export atau print laporan kapan saja.
          </p>
        </div>
        {results.length > 0 && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunk"
          >
            <Printer size={15} /> Print Semua
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <FileText className="mx-auto text-ink-soft" size={28} />
          <p className="mt-3 text-sm text-ink-soft">
            Kamu belum punya riwayat hasil assessment.
          </p>
        </div>
      ) : (
        <div id="reports-print-area" className="space-y-3">
          {results.map((r) => (
            <div
              key={r.id}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{r.title}</p>
                <p className="text-sm text-ink-soft">{formatDate(r.createdAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <p className="font-display text-xl font-semibold text-ink">{r.score}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelColor(
                      r.level
                    )}`}
                  >
                    {LEVEL_LABEL[r.level] || r.level}
                  </span>
                </div>
                <button
                  onClick={() => downloadAssessmentResultPdf(r, profile?.name || "Karyawan")}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunk print:hidden"
                >
                  <Download size={14} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
