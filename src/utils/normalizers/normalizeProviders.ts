import { availableCountries, Provider } from "@/types/providersTypes";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function normalizeProviders(
  docs: QueryDocumentSnapshot<DocumentData, DocumentData>[]
): Provider[] {
  return docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    country: availableCountries.find(
      (country) => country.code === doc.data().country
    ) || { label: "NO_COUNTRY", code: "NO_CODE", flagUrl: "" },
    type: doc.data().type,
    created_at: doc.data().created_at.toDate(),
  }));
}
