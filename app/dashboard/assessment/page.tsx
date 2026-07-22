"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { levelColor, type Level } from "@/lib/data";
import { subscribeAssessmentTypes, getMyLatestResults, type AssessmentType, type AssessmentResult } from "@/lib/firestore/assessments";
import { useAuthContext } from "@/components/FirebaseProvider";
import { Skeleton } from "@/components/Skeleton";

export default function AssessmentListPage() {
  const { user } = useAuthContext();
  const [types, setTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestByDimension, setLatestByDimension] = useState<Record<string, AssessmentResult>>({});

  useEffect(() => {
    const unsub = subscribeAssessmentTypes((t) => {
      setTypes(t);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    getMyLatestResults(user.uid)
      .then((results) => {
        const map: Record<string, AssessmentResult> = {};
        results.forEach((r) => (map[r.dimension] = r));
        setLatestByDimension(map);
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Mental Health Assessment
        </h1>
        <p className="mt-1 text-ink-soft">
          Pilih assessment untuk mengukur kondisi kamu dan dapatkan rekomendasi
          yang sesuai.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : types.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-sm text-ink-soft">
            Belum ada assessment yang tersedia. Admin bisa menambahkannya di panel Super Admin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {types.map((a) => {
            const result = latestByDimension[a.dimension];
            const level: Level | undefined = result?.level;
            return (
              <div
                key={a.slug}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold text-ink">
                      {a.title}
                    </h2>
                    {level && (
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelColor(
                          level
                        )}`}
                      >
                        {level}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-ink-soft">{a.description}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
                    <Clock size={13} /> {a.duration} &middot; {a.questions.length} pertanyaan
                  </p>
                </div>
                <Link
                  href={`/dashboard/assessment/${a.slug}`}
                  className="mt-5 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-soft"
                >
                  {result ? "Ulangi Assessment" : "Mulai Assessment"}
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
