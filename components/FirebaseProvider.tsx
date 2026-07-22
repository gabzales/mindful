"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseReady } from "@/lib/firebase/config";
import type { UserProfile, Role } from "@/lib/roles";
import { ROLES } from "@/lib/roles";

interface AuthCtx {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configError: boolean;
}

const defaultProfile: UserProfile = {
  uid: "",
  email: "",
  name: "Andi Pratama",
  role: ROLES.EMPLOYEE,
  department: "Finance",
  jobLevel: "Staff",
  gender: "Male",
  age: 29,
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  profile: null,
  loading: true,
  configError: false,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthCtx>({
    user: null,
    profile: null,
    loading: true,
    configError: !isFirebaseReady(),
  });

  useEffect(() => {
<<<<<<< HEAD
    if (typeof window !== "undefined" && localStorage.getItem("mock_user") === "true") {
      const mockUser = {
        uid: "dummy_uid_123",
        email: "andi.pratama@mindfulness.id",
        emailVerified: true,
        displayName: "Andi Pratama",
      } as any;
      
      const mockProfile: UserProfile = {
        uid: "dummy_uid_123",
        email: "andi.pratama@mindfulness.id",
        name: "Andi Pratama",
        role: ROLES.EMPLOYEE,
        department: "Finance",
        jobLevel: "Staff",
        gender: "Male",
        age: 29,
        company: "Mindfulness Indonesia",
      };
      
      setState({ user: mockUser, profile: mockProfile, loading: false, configError: false });
      return;
    }

=======
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
    if (!isFirebaseReady()) {
      setState({ user: null, profile: null, loading: false, configError: true });
      return;
    }
    const unsub = onAuthStateChanged(auth!, async (user) => {
      if (!user) {
        setState({ user: null, profile: null, loading: false, configError: false });
        return;
      }
      const fbDb = db!;
      try {
        const snap = await getDoc(doc(fbDb, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          const profile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            name: data.name || user.displayName || "",
            role: (data.role as Role) || ROLES.EMPLOYEE,
            department: data.department,
            jobLevel: data.jobLevel,
            gender: data.gender,
            age: data.age,
            photoURL: user.photoURL || undefined,
            company: data.company,
          };
          setState({ user, profile, loading: false, configError: false });
        } else {
          setState({
            user,
            profile: {
              uid: user.uid,
              email: user.email || "",
              name: user.displayName || "",
              role: ROLES.EMPLOYEE,
              photoURL: user.photoURL || undefined,
            },
            loading: false,
            configError: false,
          });
        }
      } catch {
        setState({ user, profile: null, loading: false, configError: false });
      }
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
