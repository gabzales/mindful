import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  getDocs,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Dimension, Level } from "@/lib/data";

export interface AssessmentType {
  slug: string;
  dimension: Dimension;
  title: string;
  description: string;
  questions: string[];
  reverseScored?: boolean[];
  duration: string;
  createdAt?: unknown;
}

export type NewAssessmentType = Omit<AssessmentType, "createdAt">;

export interface AssessmentResult {
  id: string;
  uid: string;
  slug: string;
  dimension: Dimension;
  title: string;
  answers: number[];
  score: number;
  level: Level;
  createdAt?: unknown;
}

function requireDb() {
  if (!db) throw new Error("Firebase belum dikonfigurasi");
  return db;
}

export function subscribeAssessmentTypes(
  cb: (types: AssessmentType[]) => void
): Unsubscribe {
  if (!db) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, "assessmentTypes"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as AssessmentType));
  });
}

export async function saveAssessmentType(input: NewAssessmentType) {
  const fdb = requireDb();
  await setDoc(doc(fdb, "assessmentTypes", input.slug), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function deleteAssessmentType(slug: string) {
  const fdb = requireDb();
  await deleteDoc(doc(fdb, "assessmentTypes", slug));
}

export async function saveAssessmentResult(
  input: Omit<AssessmentResult, "id" | "createdAt">
) {
  const fdb = requireDb();
  await addDoc(collection(fdb, "assessmentResults"), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export function subscribeMyAllResults(
  uid: string,
  cb: (results: AssessmentResult[]) => void
): Unsubscribe {
  if (!db || !uid) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(db, "assessmentResults"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AssessmentResult, "id">) })));
  });
}

export async function getMyLatestResults(uid: string): Promise<AssessmentResult[]> {
  if (uid === "dummy_uid_123") {
    return [
      {
        id: "mock_res_1",
        uid: "dummy_uid_123",
        slug: "burnout-assessment",
        dimension: "burnout",
        title: "Burnout Assessment",
        answers: [3, 4, 3, 2],
        score: 3.2,
        level: "Medium",
      },
      {
        id: "mock_res_2",
        uid: "dummy_uid_123",
        slug: "stress-assessment",
        dimension: "stress",
        title: "Stress Level Assessment",
        answers: [4, 4, 5, 4],
        score: 4.3,
        level: "High",
      },
      {
        id: "mock_res_3",
        uid: "dummy_uid_123",
        slug: "resilience-assessment",
        dimension: "resilience",
        title: "Resilience Assessment",
        answers: [4, 4, 3, 4],
        score: 3.8,
        level: "Medium",
      },
      {
        id: "mock_res_4",
        uid: "dummy_uid_123",
        slug: "sleep-quality-assessment",
        dimension: "sleep",
        title: "Sleep Quality Assessment",
        answers: [2, 1, 2, 2],
        score: 1.8,
        level: "Low",
      }
    ];
  }
  const fdb = requireDb();
  const q = query(
    collection(fdb, "assessmentResults"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  const seenDimensions = new Set<Dimension>();
  const results: AssessmentResult[] = [];
  snap.docs.forEach((d) => {
    const data = { id: d.id, ...(d.data() as Omit<AssessmentResult, "id">) };
    if (!seenDimensions.has(data.dimension)) {
      seenDimensions.add(data.dimension);
      results.push(data);
    }
  });
  return results;
}
