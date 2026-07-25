import { BasicUser, getBasicUsersList } from "@/actions/user.actions";
import { useState, useEffect } from "react";

export const useBasicUsers = () => {
  const [data, setData] = useState<BasicUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect se encarga de llamar al Server Action al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // Llamamos directamente al Server Action como si fuera una función normal
        const data = await getBasicUsersList();
        setData(data);
      } catch (err: any) {
        setError(err.message || "Ocurrió un error inesperado");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); // El array vacío asegura que solo se ejecute una vez al cargar

  return { data, isLoading, error };
};
