"use client";

import CountryPicker from "@/components/forms/CountryPicker";
import InputGroupSection from "@/components/forms/InputGroupSection";
import { loginWithEmailAndPassword } from "@/services/auth.service";
import { createProvider } from "@/services/provider.service";
import { LoginInput, loginSchema } from "@/validations/auth.validations";
import {
  createProviderSchema,
  ProviderInput,
  ProviderOutput,
} from "@/validations/provider.validations";
import { Button, Form, Input, Select } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconMail } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useAuthStore } from "./context/AuthProvider";
import { useBranchRouter } from "@/hooks/useBranchRouter";

export default function HomePage() {
  const {
    watch,
    setValue,
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useBranchRouter();
  const user = useAuthStore((store) => store.user);

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    const res = await loginWithEmailAndPassword(data);

    setIsLoading(false);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    /* return router.push("/proveedores"); */
  };

  return (
    <main className="h-dvh max-h-full bg-background flex justify-center items-center">
      <section className="w-full max-w-md p-4 rounded-3xl overflow-y-auto h-fit bg-layer-2 flex justify-center">
        <Form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <h2 className="text-2xl text-center w-full font-semibold mb-4">
            Iniciar sesión
          </h2>

          <Input
            label="Correo"
            variant="bordered"
            size="sm"
            radius="lg"
            isInvalid={Boolean(errors.email?.message)}
            errorMessage={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Contraseña"
            variant="bordered"
            size="sm"
            radius="lg"
            isInvalid={Boolean(errors.password?.message)}
            errorMessage={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            color="primary"
            className="w-full mt-4"
            isLoading={isLoading}
          >
            Iniciar sesión
          </Button>
        </Form>
      </section>
    </main>
  );
}
