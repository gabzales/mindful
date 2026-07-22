"use client";

<<<<<<< HEAD
import { useState } from "react";
=======
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
import Link from "next/link";
import Image from "next/image";
import {
  ClipboardList,
  MessageCircle,
  GraduationCap,
  CalendarDays,
  BarChart3,
  Users,
<<<<<<< HEAD
  ArrowRight,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Moon,
  HelpCircle,
  Lock,
=======
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
} from "lucide-react";
import { PulseHero } from "@/components/WaveGauge";
import { LangToggle } from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
<<<<<<< HEAD
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
=======
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd

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

<<<<<<< HEAD
const moodTips = [
  { id: "happy", icon: Smile, label: "Senang", tip: "Bagus sekali! Bagikan energi positifmu hari ini kepada orang-orang di sekitarmu." },
  { id: "neutral", icon: Meh, label: "Biasa Saja", tip: "Hari yang biasa adalah hari yang baik. Ambil waktu sejenak untuk bersyukur atas hal-hal kecil." },
  { id: "sad", icon: Frown, label: "Sedih", tip: "Tidak apa-apa merasa sedih. Tarik napas dalam-dalam, embuskan perlahan. Kamu tidak sendirian." },
  { id: "stressed", icon: AlertCircle, label: "Cemas/Stres", tip: "Tarik napas 4 detik, tahan 4 detik, embuskan 4 detik. Lakukan ini 3 kali untuk menenangkan pikiran." },
  { id: "tired", icon: Moon, label: "Lelah", tip: "Tubuhmu butuh istirahat. Minum segelas air putih hangat dan regangkan otot-otot lehermu." },
];

export default function LandingPage() {
  const { lang } = useLang();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tipMessage, setTipMessage] = useState<string>("");

  const selectedMoodObj = moodTips.find((m) => m.id === selectedMood);
  const SelectedIcon = selectedMoodObj ? selectedMoodObj.icon : HelpCircle;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Mobile Top Header (Hidden on Desktop) */}
      <MobileHeader />

      {/* Desktop Header (Hidden on Mobile) */}
      <header className="mx-auto hidden max-w-6xl items-center justify-between gap-2 px-6 py-6 lg:flex">
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
            {t("Masuk", lang)}
          </Link>
          <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-soft">
            {t("Daftar", lang)}
          </Link>
          <LangToggle />
        </nav>
=======
export default function LandingPage() {
  const { lang } = useLang();

  return (
    <div className="bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-5 sm:gap-3 sm:px-6 sm:py-6">
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/mindfulness-logo.png"
            alt="Mindfulness Indonesia"
            width={160}
            height={40}
            priority
<<<<<<< HEAD
            className="h-auto w-40"
          />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 pt-24 sm:px-6 lg:py-32 lg:pt-32">
        <PulseHero />
        <div className="relative mx-auto max-w-xl text-center">
          {/* Badge */}
          <div className="inline-block rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 border border-amber-100/50 mb-6">
            EMPLOYEE WELLBEING PORTAL
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl font-extrabold leading-tight text-[#2A093D] sm:text-5xl">
            Be aware.
            <br />
            Be kind.
            <br />
            Be mindful.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-ink-soft max-w-md mx-auto leading-relaxed">
            Psychological assessments, counselling, webinars, and a learning center — the employee wellness platform by Mindfulness Indonesia.
          </p>

          {/* Call-to-action buttons */}
          <div className="mt-8 flex flex-col gap-3 w-full max-w-xs sm:max-w-md mx-auto sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#2A093D] px-6 py-4 text-sm font-semibold text-white shadow-md hover:bg-primary transition-colors w-full"
            >
              <span>{t("hero_cta", lang)}</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center rounded-2xl border border-border bg-white px-6 py-4 text-sm font-semibold text-ink shadow-xs hover:bg-surface-sunk transition-colors w-full"
            >
              <span>{t("hero_demo", lang)}</span>
            </Link>
          </div>

          {/* Daily Wellbeing Check-in Card */}
          <div className="mt-12 rounded-3xl bg-[#2A093D] p-6 text-left text-white shadow-xl relative overflow-hidden">
            {/* Soft gradient background patterns */}
            <div className="absolute -right-4 -bottom-4 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute left-1/3 top-1/2 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Daily Wellbeing Check-in
            </p>
            <h2 className="mt-1.5 font-display text-lg font-bold leading-tight">
              How are you feeling today?
            </h2>
            <p className="mt-1 text-xs text-purple-200">
              Track your mood and get personalized tips.
            </p>

            <div className="mt-5 flex justify-between gap-2 max-w-sm">
              {moodTips.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMood(m.id);
                    setTipMessage(m.tip);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
                  title={m.label}
                >
                  <m.icon size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules List */}
=======
            className="h-auto w-28 sm:w-40"
          />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <LangToggle />
          <Link href="/login" className="text-xs font-medium text-ink-soft hover:text-ink sm:text-sm">
            {t("Masuk", lang)}
          </Link>
          <Link href="/register" className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-soft sm:px-4 sm:text-sm">
            {t("Daftar", lang)}
          </Link>
        </nav>
      </header>

      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <PulseHero />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">{t("tagline", lang)}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            {t("hero_title", lang)}
          </h1>
          <p className="mt-5 text-lg text-ink-soft">{t("hero_desc", lang)}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-soft">
              {t("hero_cta", lang)}
            </Link>
            <Link href="/dashboard" className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-ink hover:bg-surface-sunk">
              {t("hero_demo", lang)}
            </Link>
          </div>
        </div>
      </section>

>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
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

<<<<<<< HEAD
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
=======
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
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
<<<<<<< HEAD

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <BottomNav />

      {/* Wellbeing Tip Modal Dialog */}
      {selectedMood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-xs rounded-3xl border border-border bg-surface p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SelectedIcon size={24} />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-[#2A093D]">Tips Wellbeing untuk Kamu</h3>
            <p className="mt-2 text-xs text-ink-soft leading-relaxed">{tipMessage}</p>
            <button
              onClick={() => {
                setSelectedMood(null);
                setTipMessage("");
              }}
              className="mt-5 w-full rounded-2xl bg-[#2A093D] py-3 text-xs font-semibold text-white hover:bg-primary transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
=======
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
    </div>
  );
}
