import {
  PROVIDER_COUNTRIES,
  PROVIDER_COUNTRY_OPTIONS,
} from "@/types/providersTypes";
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
  console.log(props.value);
  return (
    <Select
      defaultSelectedKeys={props.defaultSelectedKeys || [PROVIDER_COUNTRIES[0]]}
      label={props.label || "País"}
      variant="bordered"
      size="sm"
      radius="lg"
      {...props}
      disallowEmptySelection={true}
      items={
        showNullCountry
          ? [
              { key: "", title: "Todos", flagUrl: "" },
              ...PROVIDER_COUNTRY_OPTIONS,
            ]
          : PROVIDER_COUNTRY_OPTIONS
      }
      isInvalid={Boolean(errorMessage)}
      errorMessage={errorMessage}
      renderValue={(country) => {
        return country.map((country) => (
          <div key={country.key} className="flex items-center gap-2">
            {country.data?.flagUrl ? (
              <Image
                src={country.data!.flagUrl}
                alt={country.data!.title}
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
          key={country.key}
          startContent={
            country.flagUrl ? (
              <Image
                src={country.flagUrl}
                alt={country.title}
                width={20}
                height={20}
                className="w-5 h-auto rounded-sm"
              />
            ) : (
              <IconWorld />
            )
          }
        >
          {country.title}
        </SelectItem>
      )}
    </Select>
  );
};

export default CountryPicker;
