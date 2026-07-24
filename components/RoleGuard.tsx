"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "./FirebaseProvider";
import { useDemoModeSetting } from "@/hooks/useDemoModeSetting";
import type { Role } from "@/lib/roles";
import { roleRoutes } from "@/lib/roles";
import { Skeleton } from "./Skeleton";

interface Props {
  allowedRoles: Role[];
  children: React.ReactNode;
  demo?: boolean;
}

export function RoleGuard({ allowedRoles, children, demo }: Props) {
  const router = useRouter();
  const { user, profile, loading } = useAuthContext();
  const { demoModeEnabled, loading: demoLoading } = useDemoModeSetting();

  // This page is only browsable without login when BOTH are true:
  // the page opted in via the `demo` prop, AND the super-admin panel
  // toggle for demo mode is currently switched on.
  const demoActive = !!demo && demoModeEnabled;
  const stillLoading = loading || (!!demo && demoLoading);

  useEffect(() => {
    if (stillLoading) return;
    if (demoActive && !user) return;
    if (!user) {
      router.push("/login");
      return;
    }
    // Self-registerable roles (hr_client, psychologist, admedika) can skip
    // straight from registration to their dashboard without ever verifying
    // their email unless we check this here too — the dashboard/layout.tsx
    // check only covers the employee role.
    if (!user.emailVerified) {
      router.push("/verify?sent=1");
      return;
    }
    if (!profile || !allowedRoles.includes(profile.role)) {
      router.push(roleRoutes.employee);
      return;
    }
  }, [user, profile, stillLoading, allowedRoles, router, demoActive]);

  if (stillLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
    );
  }

  if (demoActive && !user) return <>{children}</>;
  if (!user) return null;
  if (!user.emailVerified) return null;
  if (!profile || !allowedRoles.includes(profile.role)) return null;

  return <>{children}</>;
}
