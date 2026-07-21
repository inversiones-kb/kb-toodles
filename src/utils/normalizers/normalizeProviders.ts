import {
  PROVIDER_COUNTRY_MAP,
  PROVIDER_TYPE_MAP,
} from "@/types/providersTypes";
import { Provider, ProviderOutput } from "@/validations/provider.validations";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function transformProvider(
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>,
): Provider {
  const data = doc.data();

  return {
    id: doc.id,
    name: data.name,
    country: data.country,
    country_data:
      PROVIDER_COUNTRY_MAP[data.country as keyof typeof PROVIDER_COUNTRY_MAP],
    type_data: PROVIDER_TYPE_MAP[data.type as keyof typeof PROVIDER_TYPE_MAP],
    type: data.type,
    created_at: data.created_at.toDate(),
    is_deleted: data.is_deleted,
    deleted_at: data.deleted_at ? data.deleted_at.toDate() : null,
  };
}
