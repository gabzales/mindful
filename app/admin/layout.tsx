"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.MI_ADMIN, ROLES.SUPER_ADMIN]} demo>
      {children}
    </RoleGuard>
  );
}
