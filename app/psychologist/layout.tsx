"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";

export default function PsychologistLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.PSYCHOLOGIST, ROLES.MI_ADMIN, ROLES.SUPER_ADMIN]} demo>
      {children}
    </RoleGuard>
  );
}
