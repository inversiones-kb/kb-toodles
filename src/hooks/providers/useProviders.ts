import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  QueryFieldFilterConstraint,
} from "firebase/firestore";
import { getDocs, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { normalizeProviders } from "@/utils/normalizers/normalizeProviders";
import { ProviderFilters } from "@/components/provider/ProviderTableToolbar";
import { Provider } from "@/validations/provider.validations";

const useProviders = (filters: ProviderFilters) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { search, country, type } = filters;

  useEffect(() => {
    const wheres: QueryFieldFilterConstraint[] = [];

    if (search) {
      wheres.push(where("name", "==", search));
    }

    if (country) {
      wheres.push(where("country", "==", country));
    }

    if (type) {
      wheres.push(where("type", "==", type));
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

    fetchProviders();
  }, [name, country, type]);

  return { providers, isLoading };
};

export default useProviders;
