import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  getDocs,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { normalizeFirestoreData } from "@/utils/firestore.utils";

interface UseCollectionQueryResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void; // 🔥 Nuestro nuevo export
}

/**
 * Hook genérico para realizar consultas complejas con cláusulas WHERE en Firestore.
 * @param collectionName Nombre de la colección.
 * @param constraints Array de condiciones de Firestore (where, orderBy, limit, etc.).
 * @param deps Array de dependencias para controlar cuándo se vuelve a ejecutar el query.
 */
export const useCollectionQuery = <T,>(
  collectionName: string,
  constraints: QueryConstraint[],
  deps: any[] = [],
  transform?: (data: QueryDocumentSnapshot<DocumentData, DocumentData>) => T, // 👈 Agregamos esta función opcional
): UseCollectionQueryResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [tick, setTick] = useState(0);

  // Envolvemos la función en useCallback para que su referencia en memoria no cambie
  const refetch = useCallback(() => {
    setTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Creamos la referencia a la colección y armamos el query con los destructuring de los constraints
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, ...constraints);

        // 2. Ejecutamos la consulta
        const querySnapshot = await getDocs(q);

        const results: T[] = [];
        querySnapshot.forEach((doc) => {
          if (transform) {
            results.push(transform(doc));
          } else {
            const rawData = { id: doc.id, ...doc.data() };
            results.push(normalizeFirestoreData(rawData) as T);
          }
        });

        setData(results);
      } catch (err: any) {
        console.error(`Error en useCollectionQuery [${collectionName}]:`, err);
        setError("Ocurrió un error al procesar la consulta.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
    // En lugar de escuchar los objetos 'constraints', escuchamos el array de dependencias primitivas del usuario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, collectionName, tick]);

  return { data, isLoading, error, refetch };
};
