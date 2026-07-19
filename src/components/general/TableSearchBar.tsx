import {
  Button,
  Form,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
} from "@heroui/react";
import DateRangePicker from "@/components/forms/DateRangePicker";
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconSearch,
} from "@tabler/icons-react";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { DateRange } from "@/types/coreTypes";
import CountryPicker from "../forms/CountryPicker";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NewProviderFields, ProviderType } from "@/types/providersTypes";
import useDebounce from "@/hooks/useDebounce";
import { ProviderFilters } from "../provider/ProviderTableToolbar";

const validationSchema = z.object({
  search: z.string().optional(),
  country: z.union([
    z.string().length(3, { message: "País inválido" }),
    z.literal(""),
  ]),
  type: z.union([z.literal("STORE"), z.literal("FREELANCER"), z.literal("")]),
  dateRange: z.custom<DateRange>(),
});

interface TableSearchBarProps {
  setFilters: Dispatch<SetStateAction<ProviderFilters>>;
  filters?: ProviderFilters;
}

const TableSearchBar = ({ filters, setFilters }: TableSearchBarProps) => {
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
          <Button color="secondary" size="lg" isIconOnly>
            <IconAdjustmentsHorizontal size={24} className="text-soft-light" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-background p-4 rounded-3xl">
          <div className="flex flex-col items-start gap-4">
            <h4>Filtros adicionales</h4>

            <form className="w-full flex flex-col gap-2 min-w-80">
              <Select
                variant="bordered"
                color="secondary"
                size="sm"
                radius="lg"
                defaultSelectedKeys={[watch("type")]}
                disallowEmptySelection
                label="Tipo de proveedor"
                {...register("type")}
                errorMessage={errors.type?.message}
                isInvalid={Boolean(errors.type?.message)}
              >
                <SelectItem key={""}>Todos</SelectItem>
                <SelectItem key={"STORE"}>Tienda</SelectItem>
                <SelectItem key={"FREELANCER"}>Independiente</SelectItem>
              </Select>

              <CountryPicker
                errorMessage={errors.country?.message}
                label="País"
                showNullCountry={true}
                defaultSelectedKeys={[watch("country")]}
                {...register("country")}
              />

              <Button
                color="default"
                radius="lg"
                className="mt-1"
                type="submit"
              >
                Aplicar
              </Button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </Form>
  );
};

export default TableSearchBar;
