import { initializeApp, getApps, cert, getApp, App } from "firebase-admin/app";

// Shared low-level app init, with no dependency on firebase-admin/auth or
// firebase-admin/firestore — those pull in their own (much heavier, and in
// auth's case ESM-incompatible) dependency trees, so anything that only
// needs one of them should import from firebase-admin.ts (Firestore) or
// firebase-admin-auth.ts (Auth) instead of importing both unconditionally.
export function getAdminApp(): App {
  if (getApps().length) return getApp();

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // El replace es crucial porque Vercel/Next.js a veces escapan los saltos de línea
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
