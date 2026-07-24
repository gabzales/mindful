"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.HR_CLIENT, ROLES.MI_ADMIN, ROLES.SUPER_ADMIN]} demo>
      {children}
    </RoleGuard>
  );
}
