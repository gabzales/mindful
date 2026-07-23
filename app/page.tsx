"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ClipboardList,
  MessageCircle,
  GraduationCap,
  CalendarDays,
  BarChart3,
  Users,
  ArrowRight,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Moon,
  Lock,
} from "lucide-react";
import { PulseHero } from "@/components/WaveGauge";
import { LangToggle } from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";

const modules = [
  { icon: ClipboardList, titleKey: "module_assessment", descKey: "module_assessment_desc" },
  { icon: MessageCircle, titleKey: "module_counseling", descKey: "module_counseling_desc" },
  { icon: CalendarDays, titleKey: "module_webinar", descKey: "module_webinar_desc" },
  { icon: GraduationCap, titleKey: "module_learning", descKey: "module_learning_desc" },
];

const roles = [
  { href: "/dashboard", titleKey: "role_employee", descKey: "role_employee_desc" },
  { href: "/hr", titleKey: "role_hr", descKey: "role_hr_desc" },
  { href: "/admin", titleKey: "role_admin", descKey: "role_admin_desc" },
  { href: "/admedika", titleKey: "role_admedika", descKey: "role_admedika_desc" },
  { href: "/psychologist", titleKey: "role_psychologist", descKey: "role_psychologist_desc" },
  { href: "/super-admin", titleKey: "role_superadmin", descKey: "role_superadmin_desc" },
];

const moodTips = [
  {
    id: "happy",
    icon: Smile,
    label: "Senang",
    tip: {
      ID: "Bagus sekali! Bagikan energi positifmu hari ini kepada orang-orang di sekitarmu.",
      EN: "Wonderful! Share your positive energy with people around you today."
    }
  },
  {
    id: "neutral",
    icon: Meh,
    label: "Biasa Saja",
    tip: {
      ID: "Hari yang biasa adalah hari yang baik. Ambil waktu sejenak untuk bersyukur atas hal-hal kecil.",
      EN: "An ordinary day is a good day. Take a moment to be grateful for small things."
    }
  },
  {
    id: "sad",
    icon: Frown,
    label: "Sedih",
    tip: {
      ID: "Tidak apa-apa merasa sedih. Tarik napas dalam-dalam, embuskan perlahan. Kamu tidak sendirian.",
      EN: "It's okay to feel sad. Take a deep breath and let it out. You are not alone."
    }
  },
  {
    id: "stressed",
    icon: AlertCircle,
    label: "Cemas/Stres",
    tip: {
      ID: "Tarik napas 4 detik, tahan 4 detik, embuskan 4 detik. Lakukan ini 3 kali untuk menenangkan pikiran.",
      EN: "Inhale for 4s, hold for 4s, exhale for 4s. Repeat 3 times to calm your mind."
    }
  },
  {
    id: "tired",
    icon: Moon,
    label: "Lelah",
    tip: {
      ID: "Tubuhmu butuh istirahat. Minum segelas air putih hangat dan regangkan otot-otot lehermu.",
      EN: "Your body needs rest. Drink a warm glass of water and stretch your neck muscles."
    }
  },
];

export default function LandingPage() {
  const { lang } = useLang();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const selectedMoodObj = moodTips.find((m) => m.id === selectedMood);
  const tipMessage = selectedMoodObj ? selectedMoodObj.tip[lang] : "";

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Mobile Top Header (Hidden on Desktop) */}
      <MobileHeader />

      {/* Desktop Header (Hidden on Mobile) */}
      <header className="mx-auto hidden max-w-6xl items-center justify-between gap-2 px-6 py-3 lg:flex">
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
            {t("Masuk", lang)}
          </Link>
          <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-soft">
            {t("Daftar", lang)}
          </Link>
          <LangToggle />
        </nav>
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/mindful.png"
            alt="Mindfulness Indonesia"
            width={152}
            height={80}
            priority
            className="h-auto w-36 sm:w-40 object-contain"
          />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-12 pt-20 sm:px-6 lg:py-24 lg:pt-24">
        <PulseHero />
        {/* Ambient Glowing Blobs */}
        <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />
        
        {/* Grid Mesh Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1.5px,transparent_1.5px),linear-gradient(to_bottom,var(--border)_1.5px,transparent_1.5px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_80%,transparent_100%)] opacity-70 pointer-events-none" />

        <div className="relative mx-auto max-w-6xl z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center text-center lg:text-left">
            {/* Left Column (Content) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Badge */}
              <div className="inline-block self-center lg:self-start rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 border border-amber-100/50 mb-4">
                EMPLOYEE WELLBEING PORTAL
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl font-extrabold leading-tight text-[#2A093D] sm:text-5xl lg:text-6xl tracking-tight">
                {lang === "EN" ? (
                  <>
                    Be aware.<br />
                    Be kind.<br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent font-black">Be mindful.</span>
                  </>
                ) : (
                  <>
                    Sadari.<br />
                    Peduli.<br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent font-black">Tenang.</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="mt-4 text-base text-ink-soft max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t("hero_desc", lang)}
              </p>

              {/* Call-to-action buttons */}
              <div className="mt-6 flex flex-col gap-3 w-full max-w-xs sm:max-w-md mx-auto lg:mx-0 sm:flex-row">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-white shadow-md hover:bg-primary-soft hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
                >
                  <span>{t("hero_cta", lang)}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center rounded-2xl border border-border bg-white px-8 py-4 text-sm font-semibold text-ink shadow-xs hover:bg-surface-sunk hover:border-primary/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
                >
                  <span>{t("hero_demo", lang)}</span>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 pt-6 border-t border-border/50 flex flex-wrap gap-x-6 gap-y-3 justify-center lg:justify-start text-xs text-ink-soft">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Google Sign-In & OTP
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Sesuai Standar Medis & Privasi
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Integrasi Partner AdMedika
                </span>
              </div>
            </div>

            {/* Right Column (Interactive Mockup Widget) */}
            <div className="relative lg:col-span-5 w-full mt-8 lg:mt-0 max-w-md mx-auto">
              {/* Decorative Floating Cards/Pills */}
              <div className="absolute -left-6 -bottom-6 z-10 hidden sm:flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/80 p-3.5 shadow-xl backdrop-blur-md animate-float-slow">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Smile size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-semibold text-ink-soft uppercase tracking-wider leading-none">Self Check-in</p>
                  <p className="text-xs font-bold text-ink mt-1">Selesai Hari Ini</p>
                </div>
              </div>

              <div className="absolute -right-6 -top-6 z-10 hidden sm:flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/80 p-3.5 shadow-xl backdrop-blur-md animate-float-delayed">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-semibold text-ink-soft uppercase tracking-wider leading-none">Psikolog Terkoneksi</p>
                  <p className="text-xs font-bold text-ink mt-1">12 Aktif Online</p>
                </div>
              </div>

              {/* Main Glassmorphic Card */}
              <div className="relative rounded-3xl border border-white/40 bg-white/60 p-6 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-500">
                {/* Dynamic mood colored radial glow */}
                <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
                  selectedMood === "happy" ? "bg-success/20" :
                  selectedMood === "neutral" ? "bg-warning/20" :
                  selectedMood === "sad" ? "bg-indigo-400/20" :
                  selectedMood === "stressed" ? "bg-danger/20" :
                  selectedMood === "tired" ? "bg-primary-soft/20" :
                  "bg-primary/10"
                }`} />

                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                    Wellbeing Check-in
                  </span>
                  <span className="text-[10px] text-ink-soft font-semibold">{lang === "EN" ? "Today" : "Hari Ini"}</span>
                </div>

                <h3 className="mt-3 font-display text-base font-bold text-ink">
                  {lang === "EN" ? "How are you feeling today?" : "Bagaimana perasaanmu hari ini?"}
                </h3>
                <p className="text-[11px] text-ink-soft leading-relaxed mt-0.5">
                  {lang === "EN" ? "Choose a mood to see tips & track wellbeing." : "Pilih mood untuk tips instan & pemantauan."}
                </p>

                {/* Mood Buttons Grid */}
                <div className="mt-4 flex justify-between gap-1 sm:gap-2">
                  {moodTips.map((m) => {
                    const isSelected = selectedMood === m.id;
                    const MoodIcon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMood(m.id);
                        }}
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
                          isSelected
                            ? "bg-primary text-white scale-110 shadow-md ring-2 ring-primary-soft/10"
                            : "bg-[#F7F4FA] text-ink-soft hover:bg-primary/5 hover:text-primary active:scale-95"
                        }`}
                        title={m.label}
                      >
                        <MoodIcon size={20} />
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Inline Tip Box */}
                <div className="mt-5 min-h-[96px] rounded-2xl bg-[#F7F4FA]/80 border border-border/40 p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-center">
                  {selectedMood ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block h-2 w-2 rounded-full ${
                          selectedMood === "happy" ? "bg-success" :
                          selectedMood === "neutral" ? "bg-warning" :
                          selectedMood === "sad" ? "bg-blue-400" :
                          selectedMood === "stressed" ? "bg-danger" :
                          "bg-primary-soft"
                        }`} />
                        <p className="text-[9px] font-bold uppercase tracking-wider text-ink-soft">
                          {lang === "EN" ? "Personalized Tip" : "Tips Personal"}
                        </p>
                      </div>
                      <p className="mt-1.5 text-[11px] text-ink leading-relaxed font-medium">
                        {tipMessage}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-[11px] text-ink-soft italic leading-relaxed">
                        {lang === "EN"
                          ? "\"A mindful breath a day keeps the stress away. Select your current mood above.\""
                          : "\"Satu tarikan napas penuh kesadaran menjauhkan stres. Pilih mood Anda di atas.\""}
                      </p>
                    </div>
                  )}
                </div>

                {/* Breathing Guide Widget */}
                <div className="mt-5 pt-5 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ink-soft">
                      {lang === "EN" ? "Mindful Breathing Space" : "Ruang Napas Mindfulness"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-100/50">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live
                    </span>
                  </div>

                  <div className="flex items-center gap-4 bg-primary/5 rounded-2xl p-3.5">
                    {/* Pulsing Breathing Circle */}
                    <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
                      <div className="absolute inset-0 rounded-full bg-primary/10 animate-breath" />
                      <div className="absolute h-9 w-9 rounded-full bg-primary/20 animate-ping opacity-60" />
                      <div className="relative h-6.5 w-6.5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">
                        🧘
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="flex-1 text-left">
                      <p className="text-xs font-bold text-ink leading-snug">
                        {lang === "EN" ? "Breathing Guide" : "Panduan Bernapas"}
                      </p>
                      <p className="text-[10px] text-ink-soft mt-0.5 leading-relaxed">
                        {lang === "EN"
                          ? "Inhale as circle expands, exhale as it shrinks."
                          : "Tarik napas saat lingkaran membesar, embuskan saat mengecil."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules List */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">{t("modules_title", lang)}</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => (
            <div key={m.titleKey} className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunk text-primary">
                <m.icon size={18} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">{t(m.titleKey, lang)}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{t(m.descKey, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Keamanan & Kemitraan (Enterprise Trust) Section */}
      <section className="mx-auto max-w-6xl px-6 py-16 border-t border-border">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Keamanan & Integrasi
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Dipercaya oleh Perusahaan, Dilindungi untuk Karyawan
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Platform EAP terpadu yang dirancang dengan standar privasi medis dan integrasi jaringan asuransi kesehatan terpercaya.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* HR Analytics Column */}
          <div className="relative group rounded-3xl border border-border bg-surface p-6 transition-all hover:border-primary/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <BarChart3 size={18} />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-ink">
              Analisis Agregat HR
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              Pantau tren tingkat stres, kejenuhan (burnout), dan tingkat partisipasi per departemen secara agregat untuk mendukung kesehatan tim kerja Anda.
            </p>
          </div>

          {/* Privacy Column */}
          <div className="relative group rounded-3xl border border-border bg-surface p-6 transition-all hover:border-primary/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/5 text-success">
              <Lock size={18} className="text-success" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-ink">
              Privasi Karyawan Terjamin
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              Data personal, hasil assessment psikologi individu, dan rekam konseling bersifat rahasia. HR hanya menerima laporan statistik anonim departemen.
            </p>
          </div>

          {/* AdMedika Integration Column */}
          <div className="relative group rounded-3xl border border-border bg-surface p-6 transition-all hover:border-primary/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/5 text-amber-500">
              <Users size={18} className="text-amber-500" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-ink">
              Kemitraan AdMedika
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              Terhubung dengan sistem AdMedika untuk pemantauan utilization rate secara transparan dan ekspor laporan bulanan otomatis secara efisien.
            </p>
          </div>
        </div>
      </section>

      {/* Roles Navigation / Switcher */}
      <section className="border-t border-border bg-surface-sunk px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex items-center gap-3">
            <BarChart3 className="text-primary" size={20} />
            <h2 className="font-display text-2xl font-semibold text-ink">{t("roles_title", lang)}</h2>
          </div>
          <p className="mb-10 text-sm text-ink-soft">{t("roles_demo_notice", lang)}</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((r) => (
              <Link key={r.href} href={r.href} className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/50">
                <Users className="text-primary" size={18} />
                <h3 className="mt-3 font-display text-base font-semibold text-ink">{t(r.titleKey, lang)}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{t(r.descKey, lang)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-ink-soft">
        {t("footer", lang)}
      </footer>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <BottomNav />


    </div>
  );
}
