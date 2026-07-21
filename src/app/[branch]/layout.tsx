import {
  BUSINESS_BRANCH_MAP,
  BUSINESS_BRANCHES,
} from "@/types/businessBranch.types";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

interface BranchLayoutProps {
  children: ReactNode;
  params: Promise<any>;
}

export default async function BranchLayout({
  children,
  params,
}: BranchLayoutProps) {
  // 1. Extraemos el código de la URL
  const currentBranchCode =
    ((await params).branch as keyof typeof BUSINESS_BRANCH_MAP) ||
    BUSINESS_BRANCHES[0];

  // 2. Verificamos si existe en nuestro diccionario (ej. "la-fria")
  const isValidBranch =
    Object.keys(BUSINESS_BRANCH_MAP).includes(currentBranchCode);

  // 3. Si escribieron /sede-falsa/dashboard, rompemos la ejecución y mostramos 404

  console.log({ isValidBranch });
  if (!isValidBranch) {
    notFound();
  }

  // 4. Si la sucursal es válida, renderizamos el contenido (dashboard o cajero)
  return children;
}
