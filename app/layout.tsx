import type { Metadata } from "next";
import "./globals.css";
import { FirebaseProvider } from "@/components/FirebaseProvider";
import { LangProvider } from "@/contexts/LangContext";

export const metadata: Metadata = {
  title: "Mindfulness Indonesia | Employee Wellbeing Portal",
  description:
    "Employee Assistance Program oleh Mindfulness Indonesia — assessment, konseling, webinar, dan learning dalam satu portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LangProvider>
          <FirebaseProvider>{children}</FirebaseProvider>
        </LangProvider>
      </body>
    </html>
  );
}
