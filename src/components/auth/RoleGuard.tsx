"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";
import { UserRole } from "@/types/user.types";
import { useAuthStore } from "@/app/context/AuthProvider";
import { useBranchRouter } from "@/hooks/useBranchRouter";
import { BusinessBranch } from "@/types/businessBranch.types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const router = useBranchRouter();
  const nextRouter = useRouter();
  const pathname = usePathname();

  const currentBranch = useParams().branch as BusinessBranch;

  useEffect(() => {
    // Solo actuamos cuando Firebase haya terminado de cargar la sesión
    if (!isLoading) {
      if (!user) {
        // No está logueado
        nextRouter.replace("/");
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
      } else if (user.role === "CASHIER" && currentBranch !== user.branch) {
        // Está logueado como cajero, pero está en la branch de url equivocada
        // Hacemos un pathname replace a su branch real:

        const newPathname = pathname.replace(
          `/${currentBranch}`,
          `/${user.branch}`,
        );

        nextRouter.push(newPathname);
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
