import { doc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Per-user progress through the Learning Center catalog (lib/data.ts's
// `learningLibrary`). Stored as a single doc per user: learningProgress/{uid}
// = { [itemId]: number (0-100) }. One doc per user keeps this cheap to read
// (a single get/subscribe) instead of one doc per item.
export type LearningProgressMap = Record<string, number>;

export function subscribeMyLearningProgress(
  uid: string,
  cb: (progress: LearningProgressMap) => void
): Unsubscribe {
  if (!db) {
    cb({});
    return () => {};
  }
  return onSnapshot(
    doc(db, "learningProgress", uid),
    (snap) => cb((snap.data() as LearningProgressMap | undefined) || {}),
    () => cb({})
  );
}

export async function setLearningProgress(uid: string, itemId: string, progress: number) {
  if (!db) throw new Error("Firebase belum dikonfigurasi");
  await setDoc(doc(db, "learningProgress", uid), { [itemId]: progress }, { merge: true });
}
