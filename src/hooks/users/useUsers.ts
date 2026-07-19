import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  QueryFieldFilterConstraint,
} from "firebase/firestore";
import { getDocs, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { EmployeeFilters } from "@/components/employee/EmployeeTableToolbar";
import { User } from "@/validations/user.validations";
import { normalizeUsers } from "@/utils/normalizers/normalizeUsers";

const useUsers = (filters: EmployeeFilters) => {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { search, role } = filters;

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);

      const wheres: QueryFieldFilterConstraint[] = [];

      if (search) {
        wheres.push(where("name", "==", search));
      }

      if (role) {
        wheres.push(where("role", "==", role));
      }

      const qCollection = collection(db, "users");
      const q = query(qCollection, ...wheres);
      const querySnapshot = await getDocs(q);
      const data = normalizeUsers(querySnapshot.docs);
      setData(data);
      setIsLoading(false);
    };

    fetch();
  }, [search, role]);

  return { users: data, isLoading };
};

export default useUsers;
