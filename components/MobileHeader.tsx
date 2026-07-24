"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Globe, LogOut, ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { useAuthContext } from "@/components/FirebaseProvider";
import { signOut } from "@/lib/firebase/auth";
import { t } from "@/lib/i18n";

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLang();
  const { user, profile } = useAuthContext();

  const handleLangToggle = () => {
    setLang(lang === "EN" ? "ID" : "EN");
  };

  const menuItems = user
    ? [
        { href: "/dashboard", label: "Beranda" },
        { href: "/dashboard/assessment", label: "Assessment" },
        { href: "/dashboard/counseling", label: "Konseling" },
        { href: "/dashboard/webinar", label: "Webinar" },
        { href: "/dashboard/learning", label: "Learning Center" },
        { href: "/dashboard/reports", label: "Laporan Saya" },
        { href: "/dashboard/settings", label: "Pengaturan" },
      ]
    : [
        { href: "/", label: "Beranda" },
        { href: "/login", label: "Masuk" },
        { href: "/register", label: "Daftar" },
      ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border bg-surface px-4 py-3 shadow-sm lg:hidden">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/mindful.png"
            alt="Mindfulness Indonesia"
            width={96}
            height={50}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Lang Toggle */}
          <button
            onClick={handleLangToggle}
            className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-sunk transition-colors"
          >
            <Globe size={13} className="text-ink-soft" />
            <span>{lang === "EN" ? "EN / ID" : "ID / EN"}</span>
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-ink hover:bg-surface-sunk transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative ml-auto flex h-full w-4/5 max-w-sm flex-col bg-surface p-6 shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="font-display font-semibold text-ink">Menu Navigasi</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-ink hover:bg-surface-sunk transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Section (If Logged In) */}
            {user && (
              <Link
                href="/dashboard/settings"
                onClick={() => setMenuOpen(false)}
                className="my-5 flex items-center gap-3 rounded-xl bg-surface-sunk p-3 transition-colors hover:bg-surface-sunk/70"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {profile?.name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {profile?.name || "Pengguna"}
                  </p>
                  <p className="truncate text-xs text-ink-soft">
                    {profile?.department || "Karyawan"}
                  </p>
                </div>
              </Link>
            )}

            {/* Links List */}
            <nav className="mt-4 flex-1 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-sunk transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight size={14} className="text-ink-soft" />
                </Link>
              ))}
            </nav>

            {/* Logout/Footer */}
            {user && (
              <div className="mt-auto border-t border-border pt-4">
                <button
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/20 transition-colors"
                >
                  <LogOut size={16} />
                  <span>{t("Keluar", lang)}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
