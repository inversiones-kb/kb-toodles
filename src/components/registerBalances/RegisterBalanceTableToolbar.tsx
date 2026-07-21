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
import DateRangePicker from "@/components/forms/DateRangePicker";
import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useDebounce from "@/hooks/useDebounce";
import { createRegisterBalanceSchema } from "@/validations/registerBalance.validations";
import {
  REGISTER_BALANCE_STATUS_MAP,
  REGISTER_BALANCE_STATUS_OPTIONS,
} from "@/types/registerBalance.types";

const validationSchema = createRegisterBalanceSchema
  .pick({ checkout_number: true, status: true })
  .extend({
    search: z.string().optional(),

    dateRange: z.custom<RangeValue<DateValue>>(),
  })
  .partial();

export type RegisterBalanceFilters = z.infer<typeof validationSchema>;

interface RegisterBalanceToolbarProps {
  setFilters: Dispatch<SetStateAction<RegisterBalanceFilters>>;
  filters?: RegisterBalanceFilters;
}

const RegisterBalanceToolbar = ({
  filters,
  setFilters,
}: RegisterBalanceToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterBalanceFilters>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...filters,
    },
  });

  const onSubmit: SubmitHandler<RegisterBalanceFilters> = async (data) => {
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
                selectedKeys={[watch("status") || ""]}
                label="Estado del cierre"
                onChange={(e) => {
                  const value = e.target.value;
                  setValue(
                    "status",
                    value === ""
                      ? undefined
                      : (value as keyof typeof REGISTER_BALANCE_STATUS_MAP),
                  );
                }}
                errorMessage={errors.status?.message}
                isInvalid={Boolean(errors.status?.message)}
              >
                {REGISTER_BALANCE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.key}>{option.title}</SelectItem>
                ))}
              </Select>

              <Select
                isClearable
                variant="bordered"
                color="secondary"
                size="sm"
                selectionMode="single"
                radius="lg"
                selectedKeys={[
                  watch("checkout_number")
                    ? String(watch("checkout_number"))
                    : "",
                ]}
                label="Número de caja"
                items={[
                  { key: "1", label: "#1" },
                  { key: "2", label: "#2" },
                  { key: "3", label: "#3" },
                  { key: "4", label: "#4" },
                  { key: "5", label: "#5" },
                ]}
                onChange={(e) => {
                  const value = e.target.value;

                  setValue("checkout_number", Number(value));
                }}
                errorMessage={errors.checkout_number?.message}
                isInvalid={Boolean(errors.checkout_number?.message)}
                /*  renderValue={(item) => {
                  console.log(item);
                  return <p>{item.toString()}</p>;
                }} */
              >
                {(animal) => <SelectItem>{animal.label}</SelectItem>}
              </Select>

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

export default RegisterBalanceToolbar;
