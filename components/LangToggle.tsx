"use client";

import { useLang } from "@/contexts/LangContext";

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "EN" ? "ID" : "EN")}
      className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-sunk transition-colors"
    >
      <span className={`font-semibold ${lang === "EN" ? "text-primary" : "text-ink-soft"}`}>EN</span>
      <span className="text-ink-soft">/</span>
      <span className={`font-semibold ${lang === "ID" ? "text-primary" : "text-ink-soft"}`}>ID</span>
    </button>
  );
}
