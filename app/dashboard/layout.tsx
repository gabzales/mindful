"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuthContext } from "@/components/FirebaseProvider";
import { Skeleton, SkeletonLine } from "@/components/Skeleton";
import { ROLES } from "@/lib/roles";
<<<<<<< HEAD
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
=======
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!user.emailVerified) {
      router.push("/verify?sent=1");
      return;
    }
    if (profile && profile.role !== ROLES.EMPLOYEE) {
      router.push("/");
      return;
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
          <div className="px-6 py-6">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-2 px-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
          <div className="mt-auto border-t border-border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <SkeletonLine width="w-20" />
                <SkeletonLine width="w-14" />
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6">
                <Skeleton className="mb-5 h-5 w-48" />
                <div className="grid grid-cols-2 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <SkeletonLine width="w-24" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-primary p-6">
                <Skeleton className="mb-1 h-5 w-28 bg-primary-foreground/20" />
                <Skeleton className="h-3 w-48 bg-primary-foreground/20" />
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full bg-primary-foreground/20" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
<<<<<<< HEAD
      <MobileHeader />
      <Sidebar hideMobileToggle={true} />
      <main className="flex-1 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-8 lg:pt-10 lg:pb-10">{children}</div>
      </main>
      <BottomNav />
=======
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-8 lg:pt-10">{children}</div>
      </main>
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
    </div>
  );
}
