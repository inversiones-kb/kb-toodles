import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  QueryFieldFilterConstraint,
} from "firebase/firestore";
import { Provider } from "@/types/providersTypes";
import { getDocs, where, orderBy, limit } from "firebase/firestore";
import { useEffect, useState } from "react";
import { normalizeProviders } from "@/utils/normalizers/normalizeProviders";
import { ProvidersFilters } from "@/components/general/TableSearchBar";
import { getLocalTimeZone } from "@internationalized/date";

const useFetchProviders = (filters: ProvidersFilters) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const wheres: QueryFieldFilterConstraint[] = [];

  if (filters.search) {
    wheres.push(where("name", "==", filters.search));
  }

  if (filters.country) {
    wheres.push(where("country", "==", filters.country));
  }

  const fetchProviders = async () => {
    setIsLoading(true);
    const qCollection = collection(db, "providers");
    const q = query(qCollection, ...wheres);
    const querySnapshot = await getDocs(q);
    const data = normalizeProviders(querySnapshot.docs);
    setProviders(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  return { providers, isLoading };
};

export default useFetchProviders;
