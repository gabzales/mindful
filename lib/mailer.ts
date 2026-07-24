import nodemailer from "nodemailer";

// Uses Gmail SMTP with an App Password (not the regular Gmail password).
// Set these in your environment (.env.local / Vercel project settings):
//   GMAIL_USER=youraddress@gmail.com
//   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  (generated at myaccount.google.com/apppasswords)

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return cachedTransporter;
}

export function isMailerReady() {
  return getTransporter() !== null;
}

export async function sendOtpEmail(to: string, code: string) {
  const transporter = getTransporter();
  if (!transporter) throw new Error("Mailer not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing)");

  await transporter.sendMail({
    from: `"Mindfulness Indonesia" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Kode Verifikasi Anda: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#2A093D;">Mindfulness Indonesia</h2>
        <p>Gunakan kode berikut untuk memverifikasi email pendaftaran kamu:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2A093D;">${code}</p>
        <p style="color:#6B5A78; font-size: 13px;">Kode berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.</p>
      </div>
    `,
  });
}
