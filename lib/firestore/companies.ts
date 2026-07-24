import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// A lightweight company directory. Deliberately keyed by `name` (matching
// the freeform `company` string already stored on user profiles — see
// lib/roles.ts UserProfile.company and app/register/RegisterFlow.tsx)
// rather than introducing a companyId foreign key everywhere. That keeps
// this additive: every place that already scopes data by `company` (HR
// dashboard, /api/stats, /api/employees) keeps working unchanged, this
// collection just gives admins a place to manage the list of valid
// companies, contract/quota metadata, and a PIC contact.
export interface Company {
  id: string;
  name: string;
  picName?: string;
  picEmail?: string;
  picPhone?: string;
  employeeQuota?: number;
  status: "active" | "inactive";
  notes?: string;
  createdAt?: unknown;
}

export type NewCompany = Omit<Company, "id" | "createdAt">;

function requireDb() {
  if (!db) throw new Error("Firebase belum dikonfigurasi");
  return db;
}

export function subscribeCompanies(cb: (list: Company[]) => void): Unsubscribe {
  if (!db) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, "companies"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Company, "id">) })));
  });
}

export async function createCompany(input: NewCompany) {
  const fdb = requireDb();
  await addDoc(collection(fdb, "companies"), { ...input, createdAt: serverTimestamp() });
}

export async function updateCompany(id: string, input: Partial<NewCompany>) {
  const fdb = requireDb();
  await updateDoc(doc(fdb, "companies", id), { ...input });
}

export async function deleteCompany(id: string) {
  const fdb = requireDb();
  await deleteDoc(doc(fdb, "companies", id));
}
