import { getAuth, Auth } from "firebase-admin/auth";
import { getAdminApp } from "./firebase-admin-app";

// Kept separate from firebase-admin.ts (Firestore) on purpose: importing
// firebase-admin/auth pulls in jwks-rsa -> jose, and jose's installed
// build is ESM-only, which crashes a CJS require() at module-import time.
// That crash bypasses any try/catch in the importing module entirely,
// so anything that only needs adminDb must never import this file.
let auth: Auth | null = null;

try {
  auth = getAuth(getAdminApp());
} catch (error) {
  console.error("Error inicializando Firebase Auth (Admin)", error);
}

export const adminAuth = auth;
