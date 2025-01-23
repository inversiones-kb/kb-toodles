"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NextUIProvider } from "@nextui-org/react";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const router = useRouter();

  return <NextUIProvider navigate={router.push}>{children}</NextUIProvider>;
}
