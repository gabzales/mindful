import { collection, doc, updateDoc, deleteDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Role } from "@/lib/roles";

// Admin-facing user directory. Only ever called from screens gated to
// super_admin / mi_admin (RoleGuard), which lines up with firestore.rules:
// isAdmin() gets unconditional read/update on any /users/{uid} doc, and
// (as of this change) delete too. Never call this from HR/AdMedika/
// psychologist/employee screens — those roles are intentionally NOT
// isAdmin(), so these calls would just fail against the rules, and more
// importantly they must never get a raw cross-employee read path (see the
// security notes in firestore.rules and lib/firestore/analytics.ts).
export interface AdminUserRow {
  uid: string;
  name: string;
  email: string;
  role: Role;
  company?: string;
  department?: string;
  createdAt?: unknown;
}

function requireDb() {
  if (!db) throw new Error("Firebase belum dikonfigurasi");
  return db;
}

export async function listAllUsers(): Promise<AdminUserRow[]> {
  const fdb = requireDb();
  const snap = await getDocs(query(collection(fdb, "users"), orderBy("name")));
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AdminUserRow, "uid">) }));
}

export async function updateUserRoleCompany(
  uid: string,
  data: { role?: Role; company?: string; department?: string }
) {
  const fdb = requireDb();
  await updateDoc(doc(fdb, "users", uid), data);
}

// NOTE: this only removes the person's Firestore profile/access — it does
// NOT delete their underlying Firebase Authentication account (that would
// require the Admin SDK, which isn't reliably configured in every
// deployment of this project — see FIREBASE_ADMIN_* in .env). After this
// runs, the person keeps their login credentials but loses all role-based
// access (RoleGuard requires a /users/{uid} doc to resolve a role), and
// could self-register a fresh profile again through /register with the
// same email if not otherwise prevented.
export async function deleteUserProfile(uid: string) {
  const fdb = requireDb();
  await deleteDoc(doc(fdb, "users", uid));
}
