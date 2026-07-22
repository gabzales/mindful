"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]} demo>
      {children}
    </RoleGuard>
  );
}
