"use client";

import {
  createProviderSchema,
  Provider,
  ProviderInput,
  ProviderOutput,
} from "@/validations/provider.validations";
import { Button, Form, Input, Select, SelectItem } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import InputGroupSection from "../forms/InputGroupSection";
import CountryPicker from "../forms/CountryPicker";
import {
  PROVIDER_COUNTRIES,
  PROVIDER_COUNTRY_OPTIONS,
  PROVIDER_TYPE_MAP,
  PROVIDER_TYPES,
} from "@/types/providersTypes";

interface Props {
  onSubmit: SubmitHandler<ProviderOutput>;
  initialData?: Provider;
}

const ProviderForm = ({ onSubmit, initialData }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProviderInput>({
    resolver: zodResolver(createProviderSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          country: initialData.country,
          type: initialData.type,
        }
      : {},
  });

  return (
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

          <CountryPicker
            label="País"
            defaultSelectedKeys={
              initialData ? [initialData.country] : undefined
            }
            errorMessage={errors.country?.message}
            {...register("country")}
          />

          <Select
            defaultSelectedKeys={
              initialData ? [initialData.type] : [PROVIDER_TYPES[0]]
            }
            label="Tipo de proveedor"
            variant="bordered"
            size="sm"
            radius="lg"
            disallowEmptySelection={true}
            {...register("type")}
            isInvalid={Boolean(errors.type?.message)}
            errorMessage={errors.type?.message}
          >
            {PROVIDER_TYPES.map((type) => (
              <SelectItem key={type}>
                {PROVIDER_TYPE_MAP[type].title}
              </SelectItem>
            ))}
            {/* <SelectItem key={"STORE"}>Tienda</SelectItem>
                <SelectItem key={"FREELANCER"}>Independiente</SelectItem> */}
          </Select>
        </InputGroupSection>

        <Button
          type="submit"
          color="primary"
          className="w-full mt-4"
          isLoading={isSubmitting}
        >
          {initialData ? "Actualizar proveedor" : "Crear proveedor"}
        </Button>
      </Form>
    </div>
  );
};

export default ProviderForm;
