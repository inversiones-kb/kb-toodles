import { availableCountries } from "@/types/providersTypes";
import { Select, SelectItem, SelectProps } from "@heroui/react";
import React from "react";
import Image from "next/image";
import { IconWorld } from "@tabler/icons-react";

interface CountryPickerProps extends Omit<SelectProps, "children"> {
  errorMessage?: string;
  showNullCountry?: boolean;
}

const CountryPicker = ({
  errorMessage,
  showNullCountry = false,
  ...props
}: CountryPickerProps) => {
  return (
    <Select
      defaultSelectedKeys={availableCountries[0].code}
      label={props.label || "País"}
      variant="bordered"
      size="sm"
      radius="lg"
      {...props}
      disallowEmptySelection={true}
      items={
        showNullCountry
          ? [{ code: "", label: "Todos", flagUrl: "" }, ...availableCountries]
          : availableCountries
      }
      isInvalid={Boolean(errorMessage)}
      errorMessage={errorMessage}
      renderValue={(country) => {
        return country.map((country) => (
          <div key={country.key} className="flex items-center gap-2">
            {country.data?.flagUrl ? (
              <Image
                src={country.data!.flagUrl}
                alt={country.data!.label}
                width={20}
                height={20}
                className="w-5 h-auto rounded-sm"
              ></Image>
            ) : (
              <IconWorld size={18} />
            )}
            <p>{country.rendered}</p>
          </div>
        ));
      }}
    >
      {(country) => (
        <SelectItem
          key={country.code}
          startContent={
            country.flagUrl ? (
              <Image
                src={country.flagUrl}
                alt={country.label}
                width={20}
                height={20}
                className="w-5 h-auto rounded-sm"
              />
            ) : (
              <IconWorld />
            )
          }
        >
          {country.label}
        </SelectItem>
      )}
    </Select>
  );
};

export default CountryPicker;
