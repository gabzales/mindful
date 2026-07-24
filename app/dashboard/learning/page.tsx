"use client";

import { useEffect, useState } from "react";
import { Play, FileText, Headphones, Wind, Check, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { learningLibrary } from "@/lib/data";
import { useAuthContext } from "@/components/FirebaseProvider";
import {
  subscribeMyLearningProgress,
  setLearningProgress,
  type LearningProgressMap,
} from "@/lib/firestore/learning";
import { Skeleton } from "@/components/Skeleton";

const typeIcon = {
  Video: Play,
  Article: FileText,
  Podcast: Headphones,
  "Mindfulness Audio": Wind,
};

const subItemsMap: Record<string, { title: string; duration?: string }[]> = {
  l1: [
    { title: "Pengenalan Teknik Bernapas", duration: "2 min" },
    { title: "Latihan Inti Napas Sadar", duration: "5 min" },
    { title: "Integrasi Sehari-hari & Penutup", duration: "3 min" },
  ],
  l2: [
    { title: "Definisi & Gejala Umum Burnout", duration: "2 min" },
    { title: "Perbedaan Stres vs Burnout", duration: "3 min" },
    { title: "Langkah Pencegahan & Pemulihan", duration: "3 min" },
  ],
  l3: [
    { title: "Memahami Batasan Diri (Batas Fisik & Emosional)", duration: "2 min" },
    { title: "Teknik Berkata 'Tidak' Secara Profesional", duration: "2 min" },
    { title: "Menyusun Jadwal Kerja yang Tegas", duration: "2 min" },
  ],
  l4: [
    { title: "Mengapa Resilience Itu Penting?", duration: "5 min" },
    { title: "Studi Kasus Menghadapi Tekanan Proyek", duration: "10 min" },
    { title: "Tips Membangun Tim yang Tangguh", duration: "7 min" },
  ],
  l5: [
    { title: "Pemindaian Tubuh (Body Scan) untuk Rileks", duration: "4 min" },
    { title: "Pelepasan Ketegangan Otot", duration: "5 min" },
    { title: "Transisi Menuju Tidur Lelap", duration: "3 min" },
  ],
};

export default function LearningPage() {
  const { user, loading: authLoading } = useAuthContext();
  const [progress, setProgress] = useState<LearningProgressMap>({});
  const [progressLoading, setProgressLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loading = authLoading || (!!user && progressLoading);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeMyLearningProgress(user.uid, (p) => {
      setProgress(p);
      setProgressLoading(false);
    });
    return unsub;
  }, [user]);

  async function handleToggleProgress(itemId: string, nextProgressVal: number) {
    if (!user) return;
    setSavingId(itemId);
    const current = progress[itemId] ?? 0;

    // Optimistic update
    setProgress((prev) => ({ ...prev, [itemId]: nextProgressVal }));
    try {
      await setLearningProgress(user.uid, itemId, nextProgressVal);
    } catch {
      // Revert on error
      setProgress((prev) => ({ ...prev, [itemId]: current }));
    } finally {
      setSavingId(null);
    }
  }

  const toggleExpand = (itemId: string) => {
    setExpandedId(expandedId === itemId ? null : itemId);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#2A093D]">
          Learning Center
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Eksplorasi modul audio mindfulness, video edukasi, podcast, dan artikel pilihan untuk mendukung kesejahteraan harian Anda.
        </p>
      </div>

      <div className="space-y-4">
        {learningLibrary.map((item) => {
          const Icon = typeIcon[item.type];
          const itemProgress = progress[item.id] ?? 0;
          const isSaving = savingId === item.id;
          const isExpanded = expandedId === item.id;
          const chapters = subItemsMap[item.id] || [];
          const totalChapters = chapters.length;
          const completedChaptersCount = Math.round((itemProgress / 100) * totalChapters);

          const handleChapterToggle = (index: number) => {
            const isCurrentlyCompleted = index < completedChaptersCount;
            let nextProgressVal = 0;
            if (isCurrentlyCompleted) {
              // Uncheck this chapter and all after it
              nextProgressVal = Math.round((index / totalChapters) * 100);
            } else {
              // Check this chapter and all before it
              nextProgressVal = Math.round(((index + 1) / totalChapters) * 100);
            }
            if (nextProgressVal > 100) nextProgressVal = 100;
            handleToggleProgress(item.id, nextProgressVal);
          };

          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-3xl border border-border bg-surface transition-all ${
                isExpanded ? "shadow-sm border-primary/30" : "hover:border-primary/25"
              }`}
            >
              {/* Card Header (Click to Expand) */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="flex w-full items-center gap-4 p-5 text-left transition-colors focus:outline-none"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-sunk text-primary">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-sm sm:text-base text-ink">{item.title}</p>
                    <span className="rounded-full bg-surface-sunk px-2.5 py-0.5 text-[10px] font-semibold text-ink-soft">
                      {item.type}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    {loading ? (
                      <Skeleton className="h-1.5 w-40 max-w-[40vw]" />
                    ) : (
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-sunk">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-300"
                          style={{ width: `${itemProgress}%` }}
                        />
                      </div>
                    )}
                    <span className="text-xs text-ink-soft">{item.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="hidden sm:inline-block text-xs font-semibold text-ink-soft">
                    {isSaving
                      ? "Menyimpan…"
                      : itemProgress === 100
                      ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <Check size={13} /> Selesai
                        </span>
                      )
                      : itemProgress === 0
                      ? "Belum dimulai"
                      : `${itemProgress}%`}
                  </span>
                  <div className="text-ink-soft">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </button>

              {/* Collapsible Dropdown Playlist */}
              {isExpanded && (
                <div className="border-t border-border bg-[#FBF9FD] px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-3">
                    Daftar Materi Playlist
                  </p>
                  <div className="space-y-2">
                    {chapters.map((chapter, idx) => {
                      const isChapterCompleted = idx < completedChaptersCount;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleChapterToggle(idx)}
                          disabled={!user || loading}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors border group ${
                            isChapterCompleted
                              ? "bg-white border-success/15 hover:bg-success-soft/10"
                              : "bg-white border-border hover:bg-surface-sunk"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Checkbox status */}
                            <div className="shrink-0 text-ink-soft">
                              {isChapterCompleted ? (
                                <CheckCircle2 size={18} className="text-success" />
                              ) : (
                                <Circle size={18} className="text-ink-soft/40" />
                              )}
                            </div>
                            
                            {/* Video/Media Thumbnail Placeholder */}
                            <div className="relative w-16 h-10 rounded-lg bg-[#2A093D]/10 border border-primary/5 flex items-center justify-center text-primary/60 shrink-0 overflow-hidden shadow-2xs group-hover:scale-102 transition-transform">
                              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/5 pointer-events-none" />
                              <Icon size={12} className="text-primary/70 fill-primary/10" />
                              {isChapterCompleted && (
                                <div className="absolute inset-0 bg-success/10 flex items-center justify-center">
                                  <Check size={14} className="text-success" />
                                </div>
                              )}
                            </div>

                            {/* Title & info stacked */}
                            <div className="flex flex-col">
                              <span className={`text-xs sm:text-sm font-semibold leading-tight ${
                                isChapterCompleted ? "text-ink-soft line-through" : "text-ink"
                              }`}>
                                {idx + 1}. {chapter.title}
                              </span>
                              {chapter.duration && (
                                <span className="text-[10px] text-ink-soft mt-0.5">
                                  Durasi: {chapter.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!user && (
        <p className="text-sm text-center text-ink-soft">
          Masuk untuk menyimpan progres belajar Anda.
        </p>
      )}
    </div>
  );
}
