import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Verificamos si ya hay una aplicación inicializada para evitar errores en desarrollo

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // El replace es crucial porque Vercel/Next.js a veces escapan los saltos de línea

        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Error inicializando Firebase Admin", error);
  }
}

export const adminAuth = getAuth(getApp());
export const adminDb = getFirestore(getApp());
