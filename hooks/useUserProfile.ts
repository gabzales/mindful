"use client";

import { useState, useCallback } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  updateProfile as fbUpdateProfile,
} from "firebase/auth";
import { db, auth } from "@/lib/firebase/config";
import { useAuthContext } from "@/components/FirebaseProvider";

export function useUserProfile() {
  const { user, profile } = useAuthContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateProfile = useCallback(
    async (data: {
      name?: string;
      company?: string;
      department?: string;
      jobLevel?: string;
      gender?: string;
      age?: number;
      bio?: string;
      phone?: string;
    }) => {
      if (!auth || !db) {
        setError("Firebase not configured");
        return false;
      }
      if (!profile?.uid) {
        setError("No user profile");
        return false;
      }
      setError("");
      setSuccess("");
      setSaving(true);
      try {
        const fbDb = db;
        await updateDoc(doc(fbDb, "users", profile.uid), data);
        if (data.name && auth.currentUser) {
          await fbUpdateProfile(auth.currentUser, { displayName: data.name });
        }
        setSuccess("Profil berhasil diperbarui");
        return true;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Gagal memperbarui profil");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [profile]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!auth || !user?.email) {
        setError("Firebase not configured");
        return false;
      }
      setError("");
      setSuccess("");
      setSaving(true);
      try {
        const fbAuth = auth;
        const cred = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, cred);
        await updatePassword(user, newPassword);
        setSuccess("Password berhasil diperbarui");
        return true;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Gagal mengubah password");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  const resendVerification = useCallback(async () => {
    if (!auth || !user) return false;
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/verify`,
      });
      setSuccess("Email verifikasi telah dikirim");
      return true;
    } catch {
      setError("Gagal mengirim ulang email verifikasi");
      return false;
    }
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!auth || !db || !profile?.uid) {
      setError("Firebase not configured");
      return false;
    }
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const fbDb = db;
      // Delete the Auth account first: Firebase sometimes rejects this with
      // auth/requires-recent-login if the session is a bit old. If we
      // deleted the Firestore doc first and Auth deletion then failed, the
      // user's profile would be gone but their Auth account would remain,
      // locking that email out of ever registering again. Doing Auth first
      // means a failure here just leaves the Firestore doc intact (harmless)
      // and surfaces the error so the user can re-authenticate and retry.
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      await deleteDoc(doc(fbDb, "users", profile.uid));
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menghapus akun");
      return false;
    } finally {
      setSaving(false);
    }
  }, [profile]);

  return {
    profile,
    user,
    updateProfile,
    changePassword,
    resendVerification,
    deleteAccount,
    saving,
    error,
    success,
    clearMessages: () => { setError(""); setSuccess(""); },
  };
}
