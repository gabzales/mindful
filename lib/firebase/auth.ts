import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseReady } from "./config";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady()) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth!, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}

export async function signInWithGoogle() {
  const fbAuth = auth;
  const fbProvider = googleProvider;
  const fbDb = db;
  if (!fbAuth || !fbProvider || !fbDb) throw new Error("Firebase not configured");
  const result = await signInWithPopup(fbAuth, fbProvider);
  const user = result.user;

  const userRef = doc(fbDb, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      role: "employee",
      createdAt: serverTimestamp(),
    });
  }

  return user;
}

export async function signInWithEmail(email: string, password: string) {
  const fbAuth = auth;
  if (!fbAuth) throw new Error("Firebase not configured");
  const result = await signInWithEmailAndPassword(fbAuth, email, password);
  return result.user;
}

export async function signOut() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("mock_user");
    window.location.href = "/";
    return;
  }
  const fbAuth = auth;
  if (!fbAuth) throw new Error("Firebase not configured");
  await fbSignOut(fbAuth);
}
