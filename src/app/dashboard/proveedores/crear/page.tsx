"use client";

import InputGroupSection from "@/components/forms/InputGroupSection";
import CardTitle from "@/components/home/CardTitle";
import { Button, Form, Input, Select, SelectItem } from "@heroui/react";
import { IconUserDollar } from "@tabler/icons-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PROVIDER_COUNTRY_OPTIONS,
  PROVIDER_TYPE_MAP,
  PROVIDER_TYPES,
} from "@/types/providersTypes";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CountryPicker from "@/components/forms/CountryPicker";
import {
  createProviderSchema,
  ProviderInput,
  ProviderOutput,
} from "@/validations/provider.validations";
import { createProvider } from "@/services/provider.service";
import ProviderForm from "@/components/provider/ProviderForm";

export default function CreateProviderPage() {
  const router = useRouter();

  const onSubmit = async (data: ProviderOutput) => {
    const res = await createProvider(data);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    return router.push("/dashboard/proveedores");
  };

  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Proveedores" />

        <ProviderForm onSubmit={onSubmit} />
      </section>
    </main>
  );
}
