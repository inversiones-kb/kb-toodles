"use client";

import { createContext, useContext, useRef, useEffect, ReactNode } from "react";
import { useStore } from "zustand";
import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { AuthState, AuthStoreApi, createAuthStore } from "@/store/authStore";
import { doc, getDoc } from "firebase/firestore";
import { UserRole } from "@/types/user.types";
import { CurrentUser } from "@/types/auth.types";
import { usePathname, useRouter } from "next/navigation";
import { transformUser } from "@/utils/normalizers/normalizeUsers";
import { toast } from "sonner";
import { useBranchRouter } from "@/hooks/useBranchRouter";

// 1. El contexto de React solo guardará la API de la store, no los datos reactivos directamente
const AuthStoreContext = createContext<AuthStoreApi | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useBranchRouter();
  const nextRouter = useRouter();
  const storeRef = useRef<AuthStoreApi | null>(null);
  const pathname = usePathname();

  if (!storeRef.current) {
    storeRef.current = createAuthStore();
  }

  /*  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const store = storeRef.current;
      if (!store) return;

      if (firebaseUser) {
        try {
          // 1. Buscamos los permisos en la colección 'users'
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const employeeId = userData.employee_id;

            // 2. Buscamos los datos personales en la colección 'employees'
            let employeeName = "Usuario del Sistema";
            let employeeLastName = ""

            if (employeeId) {
              const employeeDocRef = doc(db, "employees", employeeId);
              const employeeSnapshot = await getDoc(employeeDocRef);
              if (employeeSnapshot.exists()) {
                const data = employeeSnapshot.data()
                employeeName = data.name;
                employeeLastName = data.last_name
              }
            }

            // 3. Armamos el perfil definitivo
            const fullUser: CurrentUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: (userData.role as UserRole) || "VENDOR",
              employeeId: employeeId,
              name: employeeName,
              last_name: employeeLastName
            };

            store.getState().setUser(fullUser);
          } else {
            console.error("Usuario sin registro en la tabla de accesos.");
            store.getState().setUser(null);
          }
        } catch (error) {
          console.error("Error al hidratar la sesión:", error);
          store.getState().setUser(null);
        }
      } else {
        store.getState().setUser(null);
      }

      store.getState().setIsLoading(false);
    });

    return () => unsubscribe();
  }, []); */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const store = storeRef.current;
      if (!store) return;

      if (firebaseUser) {
        try {
          // 🔥 Una sola lectura rápida y directa al documento unificado
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const fullUser: CurrentUser = transformUser(userSnapshot);

            // Si el usuario fue desactivado, limpiamos la sesión local
            if (!fullUser.is_active) {
              toast.warning(
                "Este usuario ha sido desactivado, contacta con un administrador",
              );
              console.warn("Usuario desactivado intentó acceder.");
              store.getState().setUser(null);
            } else {
              console.log("Usuario autenticado");
              console.log({ pathname });
              store.getState().setUser(fullUser);

              if (pathname === "/") {
                if (fullUser.role === "CASHIER") {
                  nextRouter.replace(`/${fullUser.branch}/cajero`);
                } else if (fullUser.role === "ADMIN") {
                  router.replace("/dashboard");
                }
              }
            }
          } else {
            console.error(
              "Usuario sin registro en la tabla unificada de 'users'.",
            );
            store.getState().setUser(null);
          }
        } catch (error) {
          console.error("Error al hidratar la sesión:", error);
          store.getState().setUser(null);
        }
      } else {
        store.getState().setUser(null);
      }

      store.getState().setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
};

// 4. El Hook Consumidor con soporte para Selectores de Zustand
export const useAuthStore = <T,>(selector: (store: AuthState) => T): T => {
  const context = useContext(AuthStoreContext);

  if (!context) {
    throw new Error(
      "useAuthStore debe ser utilizado dentro de un AuthProvider",
    );
  }

  // useStore de Zustand extrae el estado de forma reactiva y optimizada
  return useStore(context, selector);
};
