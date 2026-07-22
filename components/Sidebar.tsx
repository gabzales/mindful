"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  MessageCircle,
  GraduationCap,
  CalendarDays,
  FileText,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuthContext } from "@/components/FirebaseProvider";
import { signOut } from "@/lib/firebase/auth";

const navItems = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/dashboard/assessment", label: "Assessment", icon: ClipboardList },
  { href: "/dashboard/counseling", label: "Konseling", icon: MessageCircle },
  { href: "/dashboard/webinar", label: "Webinar", icon: CalendarDays },
  { href: "/dashboard/learning", label: "Learning Center", icon: GraduationCap },
  { href: "/dashboard/reports", label: "Laporan Saya", icon: FileText },
];

<<<<<<< HEAD
export function Sidebar({ hideMobileToggle = false }: { hideMobileToggle?: boolean }) {
=======
export function Sidebar() {
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { profile } = useAuthContext();

  const name = profile?.name || "Pengguna";
  const dep = profile?.department || "";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();

  function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
    const active =
      href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(href);
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          active
            ? "bg-primary text-primary-foreground"
            : "text-ink-soft hover:bg-surface-sunk hover:text-ink"
        }`}
      >
        <Icon size={18} strokeWidth={2} />
        {label}
      </Link>
    );
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-6 py-6">
        <Image
          src="/mindfulness-logo.png"
          alt="Mindfulness Indonesia"
          width={140}
          height={35}
          priority
        />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="truncate text-xs text-ink-soft">{dep || "User"}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-sunk hover:text-ink"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <>
<<<<<<< HEAD
      {!hideMobileToggle && (
        <button
          onClick={() => setOpen(!open)}
          className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-surface shadow-md border border-border text-ink lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {!hideMobileToggle && open && (
=======
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-surface shadow-md border border-border text-ink lg:hidden"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

<<<<<<< HEAD
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-surface lg:z-30">
        {sidebarContent}
      </aside>

      {!hideMobileToggle && (
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-surface transition-transform duration-300 lg:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>
      )}
=======
      <aside className="hidden lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-surface">
        {sidebarContent}
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-surface transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
    </>
  );
}