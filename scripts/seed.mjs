/**
 * One-time seed script: populates Firestore with starter assessment
 * questionnaires and sample webinars, so the app isn't empty on first use.
 *
 * Safe to re-run — it overwrites assessmentTypes by slug (upsert) and only
 * adds webinars if the "webinars" collection is currently empty (so it
 * won't duplicate webinars you've already created from the admin panel).
 *
 * Usage:
 *   1. Make sure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,
 *      and FIREBASE_ADMIN_PRIVATE_KEY are set in your environment
 *      (same credentials used by the OTP API routes — see .env.example).
 *   2. Run: node scripts/seed.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY env vars."
  );
  process.exit(1);
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore(app);

const assessmentTypes = [
  {
    slug: "stress",
    dimension: "stress",
    title: "Stress Check",
    description: "Mengukur tingkat tekanan yang kamu rasakan dari pekerjaan sehari-hari.",
    duration: "5 menit",
    questions: [
      "Saya merasa sulit untuk rileks setelah bekerja.",
      "Saya merasa tertekan oleh tenggat waktu pekerjaan.",
      "Saya mudah merasa marah atau kesal akhir-akhir ini.",
      "Saya merasa beban kerja saya terlalu berat.",
      "Saya kesulitan berkonsentrasi karena pikiran yang penuh.",
    ],
  },
  {
    slug: "burnout",
    dimension: "burnout",
    title: "Burnout Screening",
    description: "Mendeteksi tanda kelelahan emosional akibat pekerjaan.",
    duration: "5 menit",
    questions: [
      "Saya merasa kehabisan energi di akhir hari kerja.",
      "Saya merasa sinis atau jarak dengan pekerjaan saya.",
      "Saya meragukan arti penting dari pekerjaan saya.",
      "Saya merasa tidak seproduktif biasanya.",
      "Saya merasa lelah bahkan setelah istirahat cukup.",
    ],
  },
  {
    slug: "emotional",
    dimension: "emotional",
    title: "Emotional Wellbeing",
    description: "Menilai kondisi emosional kamu secara umum.",
    duration: "4 menit",
    questions: [
      "Saya merasa nyaman mengekspresikan perasaan saya.",
      "Saya mampu mengelola emosi negatif dengan baik.",
      "Saya merasa didukung oleh orang-orang di sekitar saya.",
      "Saya merasa puas dengan kehidupan saya saat ini.",
    ],
    // All four questions here are positively phrased (agree = good), so all
    // must be reverse-scored — otherwise someone with great emotional
    // wellbeing would come out with a HIGH ("more concern") score.
    reverseScored: [true, true, true, true],
  },
  {
    slug: "sleep",
    dimension: "sleep",
    title: "Sleep Quality",
    description: "Mengevaluasi kualitas dan pola tidur kamu.",
    duration: "3 menit",
    questions: [
      "Saya kesulitan tidur nyenyak di malam hari.",
      "Saya sering terbangun di tengah malam.",
      "Saya merasa segar saat bangun tidur.",
      "Pikiran pekerjaan mengganggu waktu tidur saya.",
    ],
    // Question 3 ("feel fresh waking up") is the only positively-phrased
    // one in this set — the rest are already negative/concern-phrased.
    reverseScored: [false, false, true, false],
  },
  {
    slug: "worklife",
    dimension: "worklife",
    title: "Work-Life Balance",
    description: "Melihat keseimbangan antara pekerjaan dan kehidupan pribadi.",
    duration: "4 menit",
    questions: [
      "Saya punya cukup waktu untuk keluarga dan diri sendiri.",
      "Pekerjaan sering mengambil waktu istirahat saya.",
      "Saya bisa memisahkan waktu kerja dan waktu pribadi.",
      "Saya merasa bersalah saat tidak bekerja di luar jam kerja.",
    ],
    // Questions 1 and 3 are positively phrased; 2 and 4 are already
    // concern-phrased.
    reverseScored: [true, false, true, false],
  },
  {
    slug: "resilience",
    dimension: "resilience",
    title: "Resilience",
    description: "Mengukur kemampuan kamu bangkit dari tekanan atau kegagalan.",
    duration: "4 menit",
    questions: [
      "Saya bisa bangkit dengan cepat setelah menghadapi masalah.",
      "Saya melihat tantangan sebagai kesempatan untuk belajar.",
      "Saya tetap tenang saat menghadapi situasi sulit.",
      "Saya percaya diri bisa mengatasi kesulitan yang muncul.",
    ],
    // All four are positively phrased — high resilience must map to a LOW
    // ("good") score, not a HIGH/red one.
    reverseScored: [true, true, true, true],
  },
];

const webinars = [
  {
    title: "Mengelola Beban Kerja Tanpa Burnout",
    date: "29 Jul 2026",
    time: "13.00 WIB",
    speaker: "Dr. Maya Anindita, M.Psi",
    totalSeats: 40,
  },
  {
    title: "Tidur Berkualitas di Tengah Deadline",
    date: "02 Aug 2026",
    time: "10.00 WIB",
    speaker: "Rangga Wijaya, M.Psi., Psikolog",
    totalSeats: 60,
  },
  {
    title: "Komunikasi Asertif dengan Atasan",
    date: "07 Aug 2026",
    time: "15.00 WIB",
    speaker: "Dr. Salsabila Putri",
    totalSeats: 30,
  },
];

async function seedAssessmentTypes() {
  const batch = db.batch();
  for (const a of assessmentTypes) {
    const ref = db.collection("assessmentTypes").doc(a.slug);
    batch.set(ref, { ...a, createdAt: new Date() });
  }
  await batch.commit();
  console.log(`Seeded ${assessmentTypes.length} assessment types.`);
}

async function seedWebinars() {
  const existing = await db.collection("webinars").limit(1).get();
  if (!existing.empty) {
    console.log("Webinars collection is not empty — skipping webinar seed.");
    return;
  }
  const batch = db.batch();
  for (const w of webinars) {
    const ref = db.collection("webinars").doc();
    batch.set(ref, { ...w, seatsLeft: w.totalSeats, createdAt: new Date() });
  }
  await batch.commit();
  console.log(`Seeded ${webinars.length} webinars.`);
}

async function main() {
  await seedAssessmentTypes();
  await seedWebinars();
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
