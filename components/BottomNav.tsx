"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, MessageCircle, User } from "lucide-react";
import { useAuthContext } from "@/components/FirebaseProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  // Define paths based on auth state
  const homeHref = user ? "/dashboard" : "/";
  const assessmentHref = user ? "/dashboard/assessment" : "/login";
  const counselingHref = user ? "/dashboard/counseling" : "/login";
  const accountHref = user ? "/dashboard/settings" : "/login";

  // Determine active tab
  const isHomeActive = pathname === "/" || pathname === "/dashboard";
  const isAssessmentActive = pathname.startsWith("/dashboard/assessment");
  const isCounselingActive = pathname.startsWith("/dashboard/counseling");
  const isAccountActive =
    pathname.startsWith("/dashboard/settings") ||
    pathname.startsWith("/dashboard/reports") ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {/* Home */}
        <Link
          href={homeHref}
          className="flex flex-col items-center gap-1 text-center"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isHomeActive
                ? "bg-surface-sunk text-primary font-semibold"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <Home size={20} strokeWidth={isHomeActive ? 2.5 : 2} />
          </div>
          <span
            className={`text-2xs font-medium ${
              isHomeActive ? "text-primary font-semibold" : "text-ink-soft"
            }`}
          >
            Home
          </span>
        </Link>

        {/* Assessment */}
        <Link
          href={assessmentHref}
          className="flex flex-col items-center gap-1 text-center"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isAssessmentActive
                ? "bg-surface-sunk text-primary font-semibold"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <ClipboardList size={20} strokeWidth={isAssessmentActive ? 2.5 : 2} />
          </div>
          <span
            className={`text-2xs font-medium ${
              isAssessmentActive ? "text-primary font-semibold" : "text-ink-soft"
            }`}
          >
            Assessment
          </span>
        </Link>

        {/* Konseling */}
        <Link
          href={counselingHref}
          className="flex flex-col items-center gap-1 text-center"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isCounselingActive
                ? "bg-surface-sunk text-primary font-semibold"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <MessageCircle size={20} strokeWidth={isCounselingActive ? 2.5 : 2} />
          </div>
          <span
            className={`text-2xs font-medium ${
              isCounselingActive ? "text-primary font-semibold" : "text-ink-soft"
            }`}
          >
            Konseling
          </span>
        </Link>

        {/* Akun */}
        <Link
          href={accountHref}
          className="flex flex-col items-center gap-1 text-center"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isAccountActive
                ? "bg-surface-sunk text-primary font-semibold"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <User size={20} strokeWidth={isAccountActive ? 2.5 : 2} />
          </div>
          <span
            className={`text-2xs font-medium ${
              isAccountActive ? "text-primary font-semibold" : "text-ink-soft"
            }`}
          >
            Akun
          </span>
        </Link>
      </div>
    </div>
  );
}
