/**
 * One-time script: creates (or updates) the Super Admin account
 * admin@mindfulness.id / admin774411
 *
 * - Creates the Firebase Auth user if it doesn't exist yet (or updates the
 *   password if it does), with emailVerified = true so it skips the
 *   /verify step.
 * - Upserts the matching Firestore users/{uid} profile with role
 *   "super_admin" (full access — routes to /super-admin).
 *
 * Usage:
 *   1. Make sure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,
 *      and FIREBASE_ADMIN_PRIVATE_KEY are set in your environment
 *      (same credentials used by scripts/seed.mjs and the OTP API routes).
 *   2. Run: node scripts/create-admin.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY env vars."
  );
  process.exit(1);
}

const ADMIN_EMAIL = "admin@mindfulness.id";
const ADMIN_PASSWORD = "admin774411";
const ADMIN_NAME = "Admin Mindfulness Indonesia";
const ADMIN_ROLE = "super_admin"; // change to "mi_admin" here if you meant the MI Administrator role instead

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  let uid;

  try {
    const existing = await auth.getUserByEmail(ADMIN_EMAIL);
    uid = existing.uid;
    await auth.updateUser(uid, {
      password: ADMIN_PASSWORD,
      emailVerified: true,
      displayName: ADMIN_NAME,
    });
    console.log(`Updated existing auth user (${ADMIN_EMAIL}), uid=${uid}`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      const created = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        emailVerified: true,
        displayName: ADMIN_NAME,
      });
      uid = created.uid;
      console.log(`Created new auth user (${ADMIN_EMAIL}), uid=${uid}`);
    } else {
      throw err;
    }
  }

  await db.doc(`users/${uid}`).set(
    {
      uid,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: ADMIN_ROLE,
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(`Firestore profile users/${uid} set with role "${ADMIN_ROLE}".`);
  console.log("Done. You can now log in with:");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
