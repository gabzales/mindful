export const ROLES = {
  SUPER_ADMIN: "super_admin",
  MI_ADMIN: "mi_admin",
  HR_CLIENT: "hr_client",
  EMPLOYEE: "employee",
  PSYCHOLOGIST: "psychologist",
  ADMEDIKA: "admedika",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  department?: string;
  jobLevel?: string;
  gender?: string;
  age?: number;
  photoURL?: string;
  company?: string;
  phone?: string;
  bio?: string;
}

export const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  mi_admin: "MI Administrator",
  hr_client: "HR Client",
  employee: "Employee",
  psychologist: "Psikolog",
  admedika: "AdMedika",
};

export const roleRoutes: Record<Role, string> = {
  super_admin: "/super-admin",
  mi_admin: "/admin",
  hr_client: "/hr",
  employee: "/dashboard",
  psychologist: "/psychologist",
  admedika: "/admedika",
};
