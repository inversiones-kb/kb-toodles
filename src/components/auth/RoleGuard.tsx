"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";
import { UserRole } from "@/types/user.types";
import { useAuthStore } from "@/app/context/AuthProvider";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    // Solo actuamos cuando Firebase haya terminado de cargar la sesión
    if (!isLoading) {
      if (!user) {
        // No está logueado
        router.replace("/");
      } else if (!allowedRoles.includes(user.role)) {
        // Está logueado, pero NO tiene permiso para esta ruta.
        // Hacemos un enrutamiento inteligente según su rol real:
        if (user.role === "CASHIER") {
          router.replace("/cajero");
        } else if (user.role === "ADMIN") {
          router.replace("/dashboard");
        } else {
          router.replace("/unauthorized"); // Ruta genérica de "Sin acceso"
        }
      }
    }
  }, [isLoading, user, allowedRoles, router]);

  // Mientras carga o si no tiene permisos, no renderizamos el HTML protegido
  // para evitar parpadeos de información sensible.
  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" color="primary" label="Verificando permisos..." />
      </div>
    );
  }

  return <>{children}</>;
}
