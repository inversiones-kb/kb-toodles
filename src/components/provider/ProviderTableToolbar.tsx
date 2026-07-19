"use client";

import {
  Button,
  DateValue,
  Form,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RangeValue,
  Select,
  SelectItem,
} from "@heroui/react";
import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import CountryPicker from "../forms/CountryPicker";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PROVIDER_COUNTRIES,
  PROVIDER_COUNTRY_MAP,
  PROVIDER_TYPE_MAP,
  PROVIDER_TYPES,
  ProviderType,
} from "@/types/providersTypes";
import useDebounce from "@/hooks/useDebounce";
import { createProviderSchema } from "@/validations/provider.validations";
import DateRangePicker from "../forms/DateRangePicker";

/* 
const validationSchemas = z.object({
  country: z.union([
    z.enum(PROVIDER_COUNTRIES, { message: "País inválido" }),
    z.literal(""),
  ]),
  type: z.union([z.literal("STORE"), z.literal("FREELANCER"), z.literal("")]),
}); */

const validationSchema = createProviderSchema
  .pick({ country: true, type: true })
  .extend({
    search: z.string().optional(),
    dateRange: z.custom<RangeValue<DateValue>>(),
  })
  .partial();

export type ProviderFilters = z.infer<typeof validationSchema>;

interface ProviderTableToolbarProps {
  setFilters: Dispatch<SetStateAction<ProviderFilters>>;
  filters?: ProviderFilters;
}

const ProviderTableToolbar = ({
  filters,
  setFilters,
}: ProviderTableToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProviderFilters>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...filters,
    },
  });

  const onSubmit: SubmitHandler<ProviderFilters> = async (data) => {
    setIsOpen(false);

    setFilters(data);
  };

  const debouncedSetSearchTerm = useDebounce((term: string) => {
    handleSubmit(onSubmit)();
  }, 500);

  return (
    <Form
      id="providers-filters"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-row items-center gap-2"
    >
      <Controller
        name="search"
        control={control}
        render={({ field }) => (
          <Input
            startContent={<IconSearch className="text-soft-light" />}
            variant="bordered"
            placeholder="Busqueda..."
            size="lg"
            classNames={{
              input: "text-small",
            }}
            radius="lg"
            {...field}
            onChange={(e) => {
              setValue("search", e.target.value);
              debouncedSetSearchTerm(e.target.value);
            }}
          />
        )}
      />

      <DateRangePicker
        onChange={(value) => {
          setValue("dateRange", value);
          handleSubmit(onSubmit)();
        }}
        defaultValue={watch("dateRange")}
        maxValue={today(getLocalTimeZone()) as any}
      />

      <Popover
        placement="bottom-end"
        showArrow
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverTrigger>
          <Button type="button" color="secondary" size="lg" isIconOnly>
            <IconAdjustmentsHorizontal size={24} className="text-soft-light" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-background p-4 rounded-3xl">
          <div className="flex flex-col items-start gap-4">
            <h4>Filtros adicionales</h4>

            <div className="w-full flex flex-col gap-2 min-w-80">
              <Select
                isClearable
                variant="bordered"
                color="secondary"
                size="sm"
                selectionMode="single"
                radius="lg"
                selectedKeys={[watch("type") || ""]}
                label="Tipo de proveedor"
                onChange={(e) => {
                  const value = e.target.value;
                  setValue(
                    "type",
                    value === ""
                      ? undefined
                      : (value as keyof typeof PROVIDER_TYPE_MAP),
                  );
                }}
                errorMessage={errors.type?.message}
                isInvalid={Boolean(errors.type?.message)}
              >
                {PROVIDER_TYPES.map((type) => (
                  <SelectItem key={type}>
                    {PROVIDER_TYPE_MAP[type].title}
                  </SelectItem>
                ))}
              </Select>

              <CountryPicker
                errorMessage={errors.country?.message}
                label="País"
                isClearable
                selectedKeys={[watch("country") || ""]}
                onChange={(e) => {
                  const value = e.target.value;

                  setValue(
                    "country",
                    value === ""
                      ? undefined
                      : (value as keyof typeof PROVIDER_COUNTRY_MAP),
                  );
                }}
              />

              <Button
                color="secondary"
                variant="flat"
                radius="lg"
                className="mt-1"
                type="submit"
                form="providers-filters"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Form>
  );
};

export default ProviderTableToolbar;
