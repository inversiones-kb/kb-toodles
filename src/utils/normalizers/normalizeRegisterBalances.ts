import { RegisterBalance } from "@/validations/registerBalance.validations";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function normalizeRegisterBalances(
  docs: QueryDocumentSnapshot<DocumentData, DocumentData>[],
): RegisterBalance[] {
  return docs.map((doc) => {
    const data = doc.data() as any;

    return {
      ...data,
      id: doc.id,
      created_at: data.created_at.toDate(),
    };
  });
}
