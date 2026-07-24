"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";

export default function AdmedikaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.ADMEDIKA, ROLES.SUPER_ADMIN]} demo>
      {children}
    </RoleGuard>
  );
}
