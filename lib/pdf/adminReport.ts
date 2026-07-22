import jsPDF from "jspdf";
import type { PlatformStats } from "@/lib/firestore/analytics";

// Generates a one-page aggregate PDF report (headcount, assessment
// completion, stress distribution) for admin dashboards (HR, AdMedika,
// Super Admin). Contains no individual employee data — aggregate numbers
// only, consistent with the "no individual data" requirement for these
// roles.
export function downloadPlatformReportPdf(stats: PlatformStats, reportTitle: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 56;
  let y = 64;

  doc.setFillColor(42, 9, 61);
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Mindfulness Indonesia", margin, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(reportTitle, margin, 60);

  y = 130;
  doc.setTextColor(90, 90, 90);
  doc.setFontSize(10);
  doc.text(
    `Dibuat: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    margin,
    y
  );

  y += 40;
  const stat = (label: string, value: string, x: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text(value, x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(120, 120, 120);
    doc.text(label, x, y + 16);
  };
  const colWidth = (pageWidth - margin * 2) / 3;
  stat(`${stats.totalEmployees}`, "Total Karyawan Terdaftar", margin);
  stat(`${stats.assessmentCompletionRate}%`, "Assessment Completion", margin + colWidth);
  stat(`${stats.totalWebinarRegistrations}`, "Total Registrasi Webinar", margin + colWidth * 2);

  y += 56;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);

  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Distribusi Tingkat Stress", margin, y);

  y += 24;
  const total =
    stats.stressDistribution.high + stats.stressDistribution.medium + stats.stressDistribution.low;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const rows: [string, number, [number, number, number]][] = [
    ["High", pct(stats.stressDistribution.high), [229, 57, 53]],
    ["Medium", pct(stats.stressDistribution.medium), [255, 164, 0]],
    ["Low", pct(stats.stressDistribution.low), [67, 160, 71]],
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  rows.forEach(([label, value, color]) => {
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin, y);
    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(margin + 70, y - 9, 220, 10, 5, 5, "F");
    doc.setFillColor(...color);
    doc.roundedRect(margin + 70, y - 9, Math.max(2.2 * value, value > 0 ? 10 : 0), 10, 5, 5, "F");
    doc.setTextColor(90, 90, 90);
    doc.text(`${value}%`, margin + 300, y);
    y += 22;
  });

  y += 20;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);

  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text("Karyawan per Department", margin, y);
  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (stats.departmentBreakdown.length === 0) {
    doc.setTextColor(150, 150, 150);
    doc.text("Belum ada data department.", margin, y);
    y += 18;
  } else {
    stats.departmentBreakdown.forEach((d) => {
      if (y > 760) {
        doc.addPage();
        y = 60;
      }
      doc.setTextColor(60, 60, 60);
      doc.text(d.department, margin, y);
      doc.text(`${d.count} orang`, pageWidth - margin - 60, y);
      y += 18;
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Laporan ini berisi data agregat saja, tidak menampilkan data individu karyawan.",
    margin,
    810
  );

  const fileSafeTitle = reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`${fileSafeTitle}-${Date.now()}.pdf`);
}
