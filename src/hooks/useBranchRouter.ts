"use client";

import { BUSINESS_BRANCHES } from "@/types/businessBranch.types";
import { useRouter, useParams } from "next/navigation";

export const useBranchRouter = () => {
  const router = useRouter();
  const params = useParams();
  const branchCode = (params?.branch as string) || BUSINESS_BRANCHES[0];

  const push = (path: string) => {
    const finalPath = branchCode ? `/${branchCode}${path}` : path;
    router.push(finalPath);
  };

  const replace = (path: string) => {
    const finalPath = branchCode ? `/${branchCode}${path}` : path;
    router.replace(finalPath);
  };

  // Retornamos nuestro router modificado, junto con los métodos originales por si acaso
  return { ...router, push, replace };
};
