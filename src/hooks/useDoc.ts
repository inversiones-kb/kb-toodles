import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { normalizeFirestoreData } from "@/utils/firestore.utils";

interface UseDocResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useDoc = <T>(
  collectionName: string,
  docId: string | undefined,
): UseDocResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Evitamos ejecuciones innecesarias si el ID aún no está disponible en la URL
    if (!docId) {
      setIsLoading(false);
      return;
    }

    const fetchDocument = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const rawData = { id: docSnap.id, ...docSnap.data() };
          const cleanData = normalizeFirestoreData(rawData) as T;

          // Inyectamos el ID en el objeto retornado para facilitar su uso en formularios
          setData(cleanData);
        } else {
          setError("El documento no existe.");
          setData(null);
        }
      } catch (err: any) {
        console.error(`Error obteniendo documento de ${collectionName}:`, err);
        setError("Ocurrió un error al cargar la información.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [collectionName, docId]);

  return { data, isLoading, error };
};
