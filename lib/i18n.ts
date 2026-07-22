export type Lang = "EN" | "ID";

const strings: Record<string, { EN: string; ID: string }> = {
  tagline: { EN: "Employee Wellbeing Portal", ID: "Portal Kesejahteraan Karyawan" },
  hero_title: { EN: "Be aware. Be kind. Be mindful.", ID: "Sadari. Peduli. Tenang." },
  hero_desc: { EN: "Psychological assessments, counselling, webinars, and a learning center \u2014 the employee wellness platform by Mindfulness Indonesia.", ID: "Asesmen psikologis, konseling, webinar, dan learning center \u2014 platform kesejahteraan karyawan oleh Mindfulness Indonesia." },
  hero_cta: { EN: "Start Your First Assessment", ID: "Mulai Assessment Pertamamu" },
  hero_demo: { EN: "View Demo Dashboard", ID: "Lihat Demo Dashboard" },
  modules_title: { EN: "Four pillars in one portal", ID: "Empat pilar dalam satu portal" },
  roles_title: { EN: "Try every angle of this prototype", ID: "Coba tiap sudut pandang prototipe ini" },
  Masuk: { EN: "Sign In", ID: "Masuk" },
  Daftar: { EN: "Register", ID: "Daftar" },
  Keluar: { EN: "Sign Out", ID: "Keluar" },
  forgot_password: { EN: "Forgot password?", ID: "Lupa password?" },
  reset_email_sent: { EN: "Reset link sent. Check your email.", ID: "Tautan reset telah dikirim. Cek email kamu." },
  module_assessment: { EN: "Assessment", ID: "Assessment" },
  module_assessment_desc: { EN: "Stress, burnout, sleep, resilience \u2014 auto-scoring with instant recommendations.", ID: "Stress, burnout, sleep, resilience \u2014 penilaian otomatis dengan rekomendasi instan." },
  module_counseling: { EN: "Counseling", ID: "Konseling" },
  module_counseling_desc: { EN: "Book 1-on-1 sessions with psychologists. Scheduled and confidential.", ID: "Booking sesi 1-on-1 dengan psikolog pilihan, terjadwal dan rahasia." },
  module_webinar: { EN: "Webinar & Training", ID: "Webinar & Training" },
  module_webinar_desc: { EN: "Registration, automatic reminders, and certificates upon completion.", ID: "Registrasi, reminder otomatis, hingga sertifikat setelah selesai." },
  module_learning: { EN: "Learning Center", ID: "Learning Center" },
  module_learning_desc: { EN: "Videos, podcasts, articles, and mindfulness audio for self-study.", ID: "Video, podcast, artikel, dan audio mindfulness untuk dipelajari mandiri." },
  role_employee: { EN: "Employee", ID: "Karyawan" },
  role_employee_desc: { EN: "Personal dashboard, assessments, and service bookings.", ID: "Dashboard personal, assessment, dan booking layanan." },
  role_hr: { EN: "HR Client", ID: "HR Client" },
  role_hr_desc: { EN: "Aggregated wellbeing data \u2014 no individual data.", ID: "Data agregat wellbeing perusahaan \u2014 tanpa data individu." },
  role_admin: { EN: "MI Administrator", ID: "Administrator MI" },
  role_admin_desc: { EN: "Manage companies, psychologists, and all platform activity.", ID: "Kelola companies, psikolog, dan seluruh aktivitas platform." },
  role_admedika: { EN: "AdMedika", ID: "AdMedika" },
  role_admedika_desc: { EN: "Usage reports across corporate clients.", ID: "Laporan utilisasi lintas klien korporat." },
  role_psychologist: { EN: "Psychologist", ID: "Psikolog" },
  role_psychologist_desc: { EN: "Session schedule, client list, and upcoming appointments.", ID: "Jadwal konseling, daftar klien, dan sesi yang akan datang." },
  role_superadmin: { EN: "Super Admin", ID: "Super Admin" },
  role_superadmin_desc: { EN: "Manage the entire platform, companies, and users.", ID: "Kelola seluruh platform, perusahaan, dan pengguna." },
  footer: { EN: "\u00a9 2026 Mindfulness Indonesia. All data shown is sample data (demo).", ID: "\u00a9 2026 Mindfulness Indonesia. Data pada portal ini adalah data contoh (demo)." },
  roles_demo_notice: { EN: "Demo mode: click any role below to preview its dashboard directly, no login required.", ID: "Mode demo: klik salah satu role di bawah untuk langsung melihat dashboard-nya, tanpa perlu login." },
};

export function t(key: string, lang: Lang): string {
  const entry = strings[key];
  if (!entry) return key;
  return entry[lang] || entry.EN;
}
