"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HeroUIProvider } from "@heroui/react";
import { useBranchRouter } from "@/hooks/useBranchRouter";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const router = useBranchRouter();

  return <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>;
}
