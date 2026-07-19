import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  QueryFieldFilterConstraint,
} from "firebase/firestore";
import { getDocs, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { normalizeRegisterBalances } from "@/utils/normalizers/normalizeRegisterBalances";
import { RegisterBalance } from "@/validations/registerBalance.validations";
import { RegisterBalanceFilters } from "@/components/registerBalances/RegisterBalanceTableToolbar";

const useRegisterBalances = (filters: RegisterBalanceFilters) => {
  const [data, setData] = useState<RegisterBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { search, status } = filters;

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);

      const wheres: QueryFieldFilterConstraint[] = [];

      if (search) {
        wheres.push(where("employee_snapshot.name", "==", search));
      }

      if (status) {
        wheres.push(where("status", "==", status));
      }

      const qCollection = collection(db, "register_balances");
      const q = query(qCollection, ...wheres);
      const querySnapshot = await getDocs(q);
      const data = normalizeRegisterBalances(querySnapshot.docs);
      setData(data);
      setIsLoading(false);
    };

    fetch();
  }, [search, status]);

  return { registerBalances: data, isLoading };
};

export default useRegisterBalances;
