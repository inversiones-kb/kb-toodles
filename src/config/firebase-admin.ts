import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Todo el init (incluyendo getAuth/getFirestore) va en un único try/catch:
// si initializeApp falla (credenciales inválidas en este entorno de
// ejecución), adminAuth/adminDb quedan en null en vez de tumbar el módulo
// completo — Next.js importa este módulo en build time para los Route
// Handlers, así que un throw acá rompe el build entero, no solo el request.
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // El replace es crucial porque Vercel/Next.js a veces escapan los saltos de línea
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Error inicializando Firebase Admin", error);
}

export const adminAuth = auth;
export const adminDb = db;
