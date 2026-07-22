import jsPDF from "jspdf";
import type { AssessmentResult } from "@/lib/firestore/assessments";

function formatDate(value: unknown): string {
  if (!value) return "-";
  // Firestore Timestamp has a toDate() method; fall back to raw Date/string.
  const asDate =
    typeof value === "object" && value !== null && "toDate" in value
      ? (value as { toDate: () => Date }).toDate()
      : new Date(value as string);
  if (isNaN(asDate.getTime())) return "-";
  return asDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const LEVEL_LABEL: Record<string, string> = { High: "Tinggi", Medium: "Sedang", Low: "Rendah" };

// Generates and triggers a download of a single-page PDF report for one
// assessment result. Runs entirely in the browser (no server round trip).
export function downloadAssessmentResultPdf(
  result: AssessmentResult,
  userName: string
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 56;
  let y = 64;

  // Header
  doc.setFillColor(42, 9, 61); // brand purple
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Mindfulness Indonesia", margin, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Laporan Hasil Assessment", margin, 60);

  y = 130;
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(result.title, margin, y);

  y += 28;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Nama: ${userName}`, margin, y);
  y += 16;
  doc.text(`Tanggal Pengisian: ${formatDate(result.createdAt)}`, margin, y);

  y += 36;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);

  y += 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Skor", margin, y);
  doc.setFontSize(28);
  doc.text(`${result.score}`, margin, y + 34);

  doc.setFontSize(13);
  doc.text("Level", margin + 160, y);
  doc.setFontSize(20);
  const levelColor: Record<string, [number, number, number]> = {
    High: [229, 57, 53],
    Medium: [255, 164, 0],
    Low: [67, 160, 71],
  };
  const [r, g, b] = levelColor[result.level] || [90, 90, 90];
  doc.setTextColor(r, g, b);
  doc.text(LEVEL_LABEL[result.level] || result.level, margin + 160, y + 28);

  y += 70;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);

  y += 34;
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Jawaban", margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(90, 90, 90);
  const scaleLabel = ["", "Tidak Pernah", "Jarang", "Kadang", "Sering", "Selalu"];
  result.answers.forEach((ans, i) => {
    if (y > 760) {
      doc.addPage();
      y = 60;
    }
    doc.text(`${i + 1}. Skor: ${ans} (${scaleLabel[ans] || "-"})`, margin, y);
    y += 16;
  });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Dokumen ini dihasilkan otomatis oleh Employee Wellbeing Portal — Mindfulness Indonesia.",
    margin,
    810
  );

  const fileSafeTitle = result.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`hasil-${fileSafeTitle}.pdf`);
}
