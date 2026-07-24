import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  serverTimestamp,
  query,
  where,
  orderBy,
  documentId,
  runTransaction,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Day of week the psychologist is available, 0=Sunday..6=Saturday, plus the
// time slots offered on that day. Kept simple (a fixed weekly pattern)
// rather than a full calendar, appropriate for an MVP.
export interface WeeklyAvailability {
  dayOfWeek: number;
  times: string[]; // e.g. ["09.00", "11.00", "14.00"]
}

export interface Psychologist {
  id: string;
  name: string;
  specialty: string;
  photo: string; // initials shown in the UI avatar circle
  linkedUid?: string; // Firebase Auth uid, if this psychologist has a login
  availability: WeeklyAvailability[];
  createdAt?: unknown;
}

export type NewPsychologist = Omit<Psychologist, "id" | "createdAt">;

export type BookingStatus = "Upcoming" | "Completed" | "Cancelled";

export interface CounselingBooking {
  id: string;
  uid: string;
  employeeName: string;
  psychologistId: string;
  psychologistName: string;
  date: string; // ISO date, e.g. "2026-07-28"
  dateLabel: string; // display date, e.g. "28 Jul 2026"
  time: string; // e.g. "14.00"
  status: BookingStatus;
  feedbackRating?: number;
  feedbackComment?: string;
  createdAt?: unknown;
}

// Admin: look up a user's uid by their email, used to link a psychologist
// profile to an existing login account.
export async function findUidByEmail(email: string): Promise<string | null> {
  const fdb = requireDb();
  const snap = await getDocs(
    query(collection(fdb, "users"), where("email", "==", email.trim().toLowerCase()))
  );
  if (snap.empty) return null;
  return snap.docs[0].id;
}

function requireDb() {
  if (!db) throw new Error("Firebase belum dikonfigurasi");
  return db;
}

// ---- Psychologists (admin-managed) ----

export function subscribePsychologists(cb: (list: Psychologist[]) => void): Unsubscribe {
  if (!db) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, "psychologists"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Psychologist, "id">) })));
  });
}

export async function createPsychologist(input: NewPsychologist) {
  const fdb = requireDb();
  await addDoc(collection(fdb, "psychologists"), { ...input, createdAt: serverTimestamp() });
}

export async function updatePsychologist(id: string, input: Partial<NewPsychologist>) {
  const fdb = requireDb();
  await updateDoc(doc(fdb, "psychologists", id), { ...input });
}

export async function deletePsychologist(id: string) {
  const fdb = requireDb();
  await deleteDoc(doc(fdb, "psychologists", id));
}

// ---- Bookings ----

// Employee: create a booking. Uses a transaction to make sure two people
// can't double-book the same psychologist/date/time slot.
export async function createBooking(input: {
  uid: string;
  employeeName: string;
  psychologistId: string;
  psychologistName: string;
  date: string;
  dateLabel: string;
  time: string;
}) {
  const fdb = requireDb();
  // Deterministic id for the slot itself, used only to detect clashes —
  // the actual booking doc gets its own auto id so history is preserved
  // even if a slot is later freed up by a cancellation.
  const slotLockRef = doc(fdb, "counselingSlotLocks", `${input.psychologistId}_${input.date}_${input.time}`);
  const bookingsRef = collection(fdb, "counselingBookings");

  await runTransaction(fdb, async (tx) => {
    const lockSnap = await tx.get(slotLockRef);
    if (lockSnap.exists()) {
      throw new Error("Slot ini baru saja dibooking orang lain, silakan pilih waktu lain");
    }
    tx.set(slotLockRef, { uid: input.uid, createdAt: serverTimestamp() });
    const newBookingRef = doc(bookingsRef);
    tx.set(newBookingRef, {
      ...input,
      status: "Upcoming",
      createdAt: serverTimestamp(),
    });
  });
}

// Employee: cancel their own upcoming booking, freeing the slot.
export async function cancelBooking(bookingId: string, psychologistId: string, date: string, time: string) {
  const fdb = requireDb();
  const bookingRef = doc(fdb, "counselingBookings", bookingId);
  const slotLockRef = doc(fdb, "counselingSlotLocks", `${psychologistId}_${date}_${time}`);
  await runTransaction(fdb, async (tx) => {
    tx.update(bookingRef, { status: "Cancelled" });
    tx.delete(slotLockRef);
  });
}

// Employee: leave feedback on a completed session.
export async function submitBookingFeedback(bookingId: string, rating: number, comment: string) {
  const fdb = requireDb();
  await updateDoc(doc(fdb, "counselingBookings", bookingId), {
    feedbackRating: rating,
    feedbackComment: comment,
  });
}

// Psychologist/Admin: mark a booking as completed.
export async function markBookingCompleted(bookingId: string) {
  const fdb = requireDb();
  await updateDoc(doc(fdb, "counselingBookings", bookingId), { status: "Completed" });
}

// Employee: realtime subscription to their own bookings, newest first.
export function subscribeMyBookings(uid: string, cb: (bookings: CounselingBooking[]) => void): Unsubscribe {
  if (!db || !uid) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(db, "counselingBookings"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CounselingBooking, "id">) })));
  });
}

// Psychologist: realtime subscription to bookings assigned to them.
export function subscribeBookingsForPsychologist(
  psychologistId: string,
  cb: (bookings: CounselingBooking[]) => void
): Unsubscribe {
  if (!db || !psychologistId) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(db, "counselingBookings"),
    where("psychologistId", "==", psychologistId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CounselingBooking, "id">) })));
  });
}

// Which (date, time) slots are already taken for a given psychologist,
// across the given list of candidate ISO dates. Used to grey out slots the
// employee shouldn't be able to pick.
//
// Uses a document-ID range query (all locks whose id starts with
// `${psychologistId}_`) instead of fetching the whole collection, so this
// stays cheap even as the number of psychologists/bookings grows.
export async function getTakenSlots(
  psychologistId: string,
  dates: string[]
): Promise<Set<string>> {
  const fdb = requireDb();
  if (dates.length === 0) return new Set();
  const snap = await getDocs(
    query(
      collection(fdb, "counselingSlotLocks"),
      where(documentId(), ">=", `${psychologistId}_`),
      where(documentId(), "<", `${psychologistId}_\uf8ff`)
    )
  );
  const taken = new Set<string>();
  snap.docs.forEach((d) => {
    const rest = d.id.slice(psychologistId.length + 1);
    const [date, time] = rest.split("_");
    if (dates.includes(date)) taken.add(`${date}_${time}`);
  });
  return taken;
}
