import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

// Server-only Firebase Admin init. Requires FIREBASE_ADMIN_* env vars
// (service account credentials) to be set in Vercel / .env.local.
// If not configured, adminDb/adminAuth are null and callers should fail
// gracefully.

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

<<<<<<< HEAD
if (
  projectId &&
  clientEmail &&
  privateKey &&
  !privateKey.includes("xxxx") &&
  !clientEmail.includes("xxxx")
) {
=======
if (projectId && clientEmail && privateKey) {
>>>>>>> 193e5985b87170ea29f4ecb458d1028b9e8bbddd
  adminApp = !getApps().length
    ? initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      })
    : getApps()[0];
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
}

export { adminDb, adminAuth };
export function isAdminReady() {
  return adminDb !== null && adminAuth !== null;
}
