"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase/config";

// Reads settings/security.demoModeEnabled from Firestore in real time.
// Defaults to true (demo stays on) until the document says otherwise, so the
// prototype keeps working out of the box even before an admin ever visits
// the settings page and Firestore's "settings/security" doc doesn't exist yet.
export function useDemoModeSetting() {
  const [demoModeEnabled, setDemoModeEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady() || !db) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      doc(db, "settings", "security"),
      (snap) => {
        const data = snap.data();
        setDemoModeEnabled(data?.demoModeEnabled ?? true);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { demoModeEnabled, loading };
}
