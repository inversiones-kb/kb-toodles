import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAdminApp } from "./firebase-admin-app";

// Deliberately does NOT import firebase-admin/auth here — that pulls in
// jwks-rsa -> jose (ESM-only, breaks require() at import time). Anything
// that needs adminAuth should import it from firebase-admin-auth.ts
// instead, so a Firestore-only consumer (like /api/ingest) never touches
// that dependency chain at all.
let db: Firestore | null = null;

try {
  db = getFirestore(getAdminApp());
} catch (error) {
  console.error("Error inicializando Firestore (Admin)", error);
}

export const adminDb = db;
