"use client";

import { BUSINESS_BRANCHES } from "@/types/businessBranch.types";
import Link, { LinkProps } from "next/link";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

// Extendemos las propiedades originales de Next.js pero forzamos href como string
interface BranchLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function BranchLink({
  href,
  children,
  className,
  ...props
}: BranchLinkProps) {
  const params = useParams();
  const branchCode = (params?.branch as string) || BUSINESS_BRANCHES[0];

  // Si no hay branchCode (ej. estás en el Login), usa el href original
  // Si lo hay, lo inyecta. Ej: href="/dashboard/empleados" -> "/sede-colon/dashboard/empleados"
  const finalHref = branchCode ? `/${branchCode}${href}` : href;

  return (
    <Link href={finalHref} className={className} {...props}>
      {children}
    </Link>
  );
}
