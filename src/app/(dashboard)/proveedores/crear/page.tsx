"use client";

import InputGroupSection from "@/components/forms/InputGroupSection";
import CardTitle from "@/components/home/CardTitle";
import { Button, Form, Input, Select, SelectItem } from "@heroui/react";
import { IconUserDollar } from "@tabler/icons-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { NewProviderFields } from "@/types/providersTypes";
import { handleNewProvider } from "@/handlers/providers/handleNewProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CountryPicker from "@/components/forms/CountryPicker";

const validationSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  country: z.string().length(3, { message: "País inválido" }),
  type: z.union([z.literal("STORE"), z.literal("FREELANCER")], {
    message: "Tipo de proveedor inválido",
  }),
});

export default function NewProviderPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewProviderFields>({
    resolver: zodResolver(validationSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit: SubmitHandler<NewProviderFields> = async (data) => {
    setIsLoading(true);
    const res = await handleNewProvider(data);

    setIsLoading(false);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    return router.push("/proveedores");
  };

  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Proveedores" />
        <div className="w-full overflow-y-auto h-full flex justify-center">
          <Form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full">
            <h2 className="text-2xl text-center w-full font-semibold mb-4">
              Completa el formulario
            </h2>
            <InputGroupSection title="Datos del proveedor">
              <Input
                label="Nombre"
                variant="bordered"
                size="sm"
                radius="lg"
                isInvalid={Boolean(errors.name?.message)}
                errorMessage={errors.name?.message}
                {...register("name")}
              />
              {/*  <Select
                defaultSelectedKeys={["COL"]}
                label="País"
                variant="bordered"
                size="sm"
                radius="lg"
                disallowEmptySelection={true}
                items={availableCountries}
                {...register("country")}
                isInvalid={Boolean(errors.country?.message)}
                errorMessage={errors.country?.message}
                renderValue={(country) => {
                  return country.map((country) => (
                    <div key={country.key} className="flex items-center gap-2">
                      <Image
                        src={country.data!.flagUrl}
                        alt={country.data!.label}
                        width={20}
                        height={20}
                        className="w-5 h-auto rounded-sm"
                      ></Image>
                      <p>{country.rendered}</p>
                    </div>
                  ));
                }}
              >
                {(country) => (
                  <SelectItem
                    key={country.code}
                    startContent={
                      <Image
                        src={country.flagUrl}
                        alt={country.label}
                        width={20}
                        height={20}
                        className="w-5 h-auto rounded-sm"
                      />
                    }
                  >
                    {country.label}
                  </SelectItem>
                )}
              </Select> */}

              <CountryPicker
                label="País"
                errorMessage={errors.country?.message}
                {...register("country")}
              />

              <Select
                defaultSelectedKeys={["STORE"]}
                label="Tipo de proveedor"
                variant="bordered"
                size="sm"
                radius="lg"
                disallowEmptySelection={true}
                {...register("type")}
                isInvalid={Boolean(errors.type?.message)}
                errorMessage={errors.type?.message}
              >
                <SelectItem key={"STORE"}>Tienda</SelectItem>
                <SelectItem key={"FREELANCER"}>Independiente</SelectItem>
              </Select>
            </InputGroupSection>

            <Button
              type="submit"
              color="primary"
              className="w-full mt-4"
              isLoading={isLoading}
            >
              Guardar nuevo proveedor
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
}
