import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  QueryFieldFilterConstraint,
} from "firebase/firestore";
import { getDocs, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Employee } from "@/validations/employee.validations";
import { normalizeEmployees } from "@/utils/normalizers/normalizeEmployees";
import { EmployeeFilters } from "@/components/employee/EmployeeTableToolbar";

const useEmployees = (filters: EmployeeFilters) => {
  const [data, setData] = useState<Employee[]>([]);
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

      const qCollection = collection(db, "employees");
      const q = query(qCollection, ...wheres);
      const querySnapshot = await getDocs(q);
      const data = normalizeEmployees(querySnapshot.docs);
      setData(data);
      setIsLoading(false);
    };

    fetch();
  }, [search, role]);

  return { employees: data, isLoading };
};

export default useEmployees;
