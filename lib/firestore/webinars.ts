import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  increment,
  query,
  orderBy,
  where,
  runTransaction,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface Webinar {
  id: string;
  title: string;
  date: string; // free-text display date, e.g. "29 Jul 2026"
  time: string; // free-text display time, e.g. "13.00 WIB"
  speaker: string;
  totalSeats: number;
  seatsLeft: number;
  zoomLink?: string; // Zoom/Google Meet URL, only shown to registered users
  createdAt?: unknown;
}

export type NewWebinar = Omit<Webinar, "id" | "createdAt" | "seatsLeft">;

function requireDb() {
  if (!db) throw new Error("Firebase belum dikonfigurasi");
  return db;
}

// Realtime list of all webinars, newest first.
export function subscribeWebinars(cb: (webinars: Webinar[]) => void): Unsubscribe {
  if (!db) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, "webinars"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Webinar, "id">) })));
  });
}

// Admin: create a new webinar. seatsLeft starts equal to totalSeats.
export async function createWebinar(input: NewWebinar) {
  const fdb = requireDb();
  await addDoc(collection(fdb, "webinars"), {
    ...input,
    seatsLeft: input.totalSeats,
    createdAt: serverTimestamp(),
  });
}

// Admin: edit an existing webinar's details, including totalSeats.
//
// If totalSeats is part of the update, seatsLeft is recalculated inside a
// transaction rather than left stale: takenSeats = oldTotalSeats - oldSeatsLeft
// stays constant across the edit, so newSeatsLeft = newTotalSeats - takenSeats
// (floored at 0, so shrinking the quota below what's already booked shows
// "Kursi Penuh" instead of a negative number, without touching the existing
// bookings/registrations themselves).
export async function updateWebinar(id: string, input: Partial<NewWebinar>) {
  const fdb = requireDb();
  const webinarRef = doc(fdb, "webinars", id);
  if (input.totalSeats === undefined) {
    await updateDoc(webinarRef, { ...input });
    return;
  }
  await runTransaction(fdb, async (tx) => {
    const snap = await tx.get(webinarRef);
    if (!snap.exists()) throw new Error("Webinar tidak ditemukan");
    const current = snap.data() as Webinar;
    const takenSeats = current.totalSeats - current.seatsLeft;
    const newSeatsLeft = Math.max(input.totalSeats! - takenSeats, 0);
    tx.update(webinarRef, { ...input, seatsLeft: newSeatsLeft });
  });
}

// Admin: delete a webinar entirely.
export async function deleteWebinar(id: string) {
  const fdb = requireDb();
  await deleteDoc(doc(fdb, "webinars", id));
}

// Employee: register for a webinar. Uses a deterministic doc id
// (`${uid}_${webinarId}`) so a user can't double-register. Runs as a
// Firestore transaction so two people racing for the last seat can't both
// succeed — one of them will see "Kursi Penuh" instead.
export async function registerForWebinar(uid: string, webinarId: string) {
  const fdb = requireDb();
  const regRef = doc(fdb, "webinarRegistrations", `${uid}_${webinarId}`);
  const webinarRef = doc(fdb, "webinars", webinarId);

  await runTransaction(fdb, async (tx) => {
    const [regSnap, webinarSnap] = await Promise.all([tx.get(regRef), tx.get(webinarRef)]);
    if (regSnap.exists()) return; // already registered
    if (!webinarSnap.exists()) throw new Error("Webinar tidak ditemukan");
    const seatsLeft = (webinarSnap.data() as Webinar).seatsLeft;
    if (seatsLeft <= 0) throw new Error("Kursi sudah penuh");
    tx.set(regRef, { uid, webinarId, registeredAt: serverTimestamp() });
    tx.update(webinarRef, { seatsLeft: increment(-1) });
  });
}

// Employee: cancel a webinar registration.
export async function unregisterFromWebinar(uid: string, webinarId: string) {
  const fdb = requireDb();
  const regRef = doc(fdb, "webinarRegistrations", `${uid}_${webinarId}`);
  const webinarRef = doc(fdb, "webinars", webinarId);

  await runTransaction(fdb, async (tx) => {
    const regSnap = await tx.get(regRef);
    if (!regSnap.exists()) return; // wasn't registered
    tx.delete(regRef);
    tx.update(webinarRef, { seatsLeft: increment(1) });
  });
}

// Realtime set of webinar IDs the given user is registered for.
export function subscribeMyRegistrations(
  uid: string,
  cb: (webinarIds: Set<string>) => void
): Unsubscribe {
  if (!db || !uid) {
    cb(new Set());
    return () => {};
  }
  const q = query(collection(db, "webinarRegistrations"), where("uid", "==", uid));
  return onSnapshot(q, (snap) => {
    const mine = new Set<string>();
    snap.docs.forEach((d) => {
      const data = d.data() as { uid: string; webinarId: string };
      mine.add(data.webinarId);
    });
    cb(mine);
  });
}
