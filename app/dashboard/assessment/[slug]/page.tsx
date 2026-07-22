"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { AssessmentType } from "@/lib/firestore/assessments";
import { AssessmentRunner } from "./AssessmentRunner";
import { Skeleton } from "@/components/Skeleton";
import Link from "next/link";

export default function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [assessment, setAssessment] = useState<AssessmentType | null | undefined>(undefined);

  useEffect(() => {
    if (!db) {
      setAssessment(null);
      return;
    }
    getDoc(doc(db, "assessmentTypes", slug))
      .then((snap) => {
        setAssessment(snap.exists() ? (snap.data() as AssessmentType) : null);
      })
      .catch(() => setAssessment(null));
  }, [slug]);

  if (assessment === undefined) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (assessment === null) {
    return (
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <p className="text-ink-soft">Assessment tidak ditemukan.</p>
        <Link href="/dashboard/assessment" className="text-sm font-medium text-primary hover:underline">
          Kembali ke daftar assessment
        </Link>
      </div>
    );
  }

  return <AssessmentRunner assessment={assessment} />;
}
