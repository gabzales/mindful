"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { ROLES } from "@/lib/roles";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  // NOTE: this used to be SUPER_ADMIN-only, which silently blocked MI Admin
  // from ever reaching /super-admin/assessments, /psychologists, and
  // /webinars — even though those three pages already declare their own
  // inner RoleGuard allowing [SUPER_ADMIN, MI_ADMIN]. A parent layout guard
  // runs before the page's own guard, so MI Admin never got that far. Fixed
  // by widening this to match, and instead locking down the two genuinely
  // super_admin-only pages (the platform overview and settings) with their
  // own explicit inner guard.
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.MI_ADMIN]} demo>
      {children}
    </RoleGuard>
  );
}
