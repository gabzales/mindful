"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Printer } from "lucide-react";
import type { Level } from "@/lib/data";
import type { AssessmentType } from "@/lib/firestore/assessments";
import { saveAssessmentResult } from "@/lib/firestore/assessments";
import { useAuthContext } from "@/components/FirebaseProvider";
import { WaveGauge } from "@/components/WaveGauge";
import { downloadAssessmentResultPdf } from "@/lib/pdf/assessmentReport";

const SCALE = [
  { value: 1, label: "Tidak Pernah" },
  { value: 2, label: "Jarang" },
  { value: 3, label: "Kadang" },
  { value: 4, label: "Sering" },
  { value: 5, label: "Selalu" },
];

function scoreToLevel(score: number): Level {
  if (score >= 66) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

// Flips answers to positively-phrased questions (reverseScored[i] === true)
// so that, across every dimension, a higher final score consistently means
// "more concern" — matching the High=red/Medium=yellow/Low=green convention
// used everywhere else (WaveGauge, levelColor, recommendations).
function applyReverseScoring(answers: number[], reverseScored?: boolean[]): number[] {
  if (!reverseScored) return answers;
  return answers.map((v, i) => (reverseScored[i] ? 6 - v : v));
}

function computeScore(answers: number[], reverseScored?: boolean[]): number {
  const scored = applyReverseScoring(answers, reverseScored);
  const rawAvg = scored.reduce((sum, v) => sum + v, 0) / (scored.length || 1);
  return Math.round(((rawAvg - 1) / 4) * 100);
}

function recommendationFor(dimension: string, level: Level) {
  const map: Record<string, string[]> = {
    stress: ["Konseling", "Mindfulness Practice"],
    burnout: ["Konseling", "Webinar Manajemen Beban Kerja"],
    emotional: ["Konseling", "Learning Center — Emotional Regulation"],
    sleep: ["Mindfulness Audio Sebelum Tidur", "Webinar Sleep Quality"],
    worklife: ["Webinar Work-Life Balance", "Konseling"],
    resilience: ["Learning Center — Resilience Building"],
  };
  if (level === "Low") return ["Pertahankan kebiasaan baik kamu saat ini"];
  return map[dimension] ?? ["Konseling"];
}

export function AssessmentRunner({ assessment }: { assessment: AssessmentType }) {
  const { user, profile } = useAuthContext();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState("");

  const total = assessment.questions.length;
  const isLast = step === total - 1;

  async function selectAnswer(value: number) {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    if (isLast) {
      setSubmitted(true);
      const score = computeScore(next, assessment.reverseScored);
      const level = scoreToLevel(score);
      if (user) {
        try {
          await saveAssessmentResult({
            uid: user.uid,
            slug: assessment.slug,
            dimension: assessment.dimension,
            title: assessment.title,
            answers: next,
            score,
            level,
          });
        } catch {
          setSaveError("Hasil tidak tersimpan ke server, tapi tetap bisa kamu lihat di bawah.");
        }
      }
    } else {
      setStep(step + 1);
    }
  }

  if (submitted) {
    const score = computeScore(answers, assessment.reverseScored);
    const level = scoreToLevel(score);
    const recs = recommendationFor(assessment.dimension, level);

    return (
      <div id="assessment-print-area" className="mx-auto max-w-lg space-y-8 text-center">
        <div>
          <p className="text-sm font-medium text-ink-soft">Hasil {assessment.title}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            Skor kamu: {score}
          </h1>
          {saveError && <p className="mt-2 text-xs text-warning">{saveError}</p>}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 text-left">
          <WaveGauge label={assessment.title} level={level} score={score} />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 text-left">
          <h2 className="font-display text-base font-semibold text-ink">
            Rekomendasi untuk kamu
          </h2>
          <ul className="mt-3 space-y-2">
            {recs.map((r) => (
              <li
                key={r}
                className="flex items-center gap-2 rounded-lg bg-surface-sunk px-3 py-2 text-sm text-ink"
              >
                <span className="text-accent">&#10003;</span> {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap justify-center gap-3 print:hidden">
          <button
            onClick={() =>
              downloadAssessmentResultPdf(
                {
                  id: "",
                  uid: user?.uid || "",
                  slug: assessment.slug,
                  dimension: assessment.dimension,
                  title: assessment.title,
                  answers,
                  score,
                  level,
                  createdAt: new Date(),
                },
                profile?.name || "Karyawan"
              )
            }
            className="flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-sunk"
          >
            <Download size={15} /> Export PDF
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-sunk"
          >
            <Printer size={15} /> Print
          </button>
        </div>
        <div className="flex justify-center gap-3 print:hidden">
          <Link
            href="/dashboard/assessment"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-sunk"
          >
            Kembali ke Assessment
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-soft"
          >
            Ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-ink-soft">
          <span>
            Pertanyaan {step + 1} dari {total}
          </span>
          <span>{Math.round(((step + 1) / total) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunk">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8">
        <p className="font-display text-xl font-medium text-ink">
          {assessment.questions[step]}
        </p>
        <div className="mt-8 space-y-2.5">
          {SCALE.map((opt) => {
            const selected = answers[step] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => selectAnswer(opt.value)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-ink hover:border-primary hover:bg-surface-sunk"
                }`}
              >
                {opt.label}
                <span className="font-mono text-xs text-ink-soft">{opt.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-4 text-sm font-medium text-ink-soft hover:text-ink"
        >
          &larr; Kembali
        </button>
      )}
    </div>
  );
}
