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
import { DateRange } from "@/types/coreTypes";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useDebounce from "@/hooks/useDebounce";
import { createEmployeeSchema } from "@/validations/employee.validations";
import { USER_ROLE_MAP, USER_ROLE_OPTIONS } from "@/types/user.types";

const validationSchema = createEmployeeSchema
  .pick({ role: true })
  .extend({
    search: z.string().optional(),

    dateRange: z.custom<RangeValue<DateValue>>(),
  })
  .partial();

export type EmployeeFilters = z.infer<typeof validationSchema>;

interface EmployeeTableToolbarProps {
  setFilters: Dispatch<SetStateAction<EmployeeFilters>>;
  filters?: EmployeeFilters;
}

const EmployeeTableToolbar = ({
  filters,
  setFilters,
}: EmployeeTableToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFilters>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...filters,
    },
  });

  const onSubmit: SubmitHandler<EmployeeFilters> = async (data) => {
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
                selectedKeys={[watch("role") || ""]}
                label="Rol del empleado"
                onChange={(e) => {
                  const value = e.target.value;
                  setValue(
                    "role",
                    value === ""
                      ? undefined
                      : (value as keyof typeof USER_ROLE_MAP),
                  );
                }}
                errorMessage={errors.role?.message}
                isInvalid={Boolean(errors.role?.message)}
              >
                {USER_ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.key}>{option.title}</SelectItem>
                ))}
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

export default EmployeeTableToolbar;
