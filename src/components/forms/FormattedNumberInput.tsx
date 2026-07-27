import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Input, InputProps } from "@heroui/react";
import { NumericFormat } from "react-number-format";

// Extendemos las props del Input de HeroUI, omitiendo las que vamos a sobreescribir
interface FormattedNumberInputProps<T extends FieldValues> extends Omit<
  InputProps,
  "name" | "value" | "onChange" | "type" | "onValueChange"
> {
  name: Path<T>;
  control: Control<T>;

  // Props opcionales de formato con valores por defecto
  decimalScale?: number;
  fixedDecimalScale?: boolean;
  prefix?: string;
  thousandSeparator?: string;
  decimalSeparator?: string;
}

export function FormattedNumberInput<T extends FieldValues>({
  name,
  control,
  decimalScale = 2,
  fixedDecimalScale = false, // Por defecto no forzamos ".00" a menos que lo pidas
  prefix = "",
  thousandSeparator = ".", // Formato venezolano/europeo por defecto
  decimalSeparator = ",",
  ...inputProps // El resto de props (label, variant, size, etc.)
}: FormattedNumberInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <NumericFormat
          customInput={Input}
          thousandSeparator={thousandSeparator}
          decimalSeparator={decimalSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          prefix={prefix}
          inputMode="decimal" // Fuerza teclado numérico en móviles
          variant="bordered"
          aria-label={inputProps["aria-label"] || inputProps.placeholder}
          size="md"
          radius="lg"
          classNames={{
            base: "w-full",
            inputWrapper: "h-12",
          }}
          // Gestión de errores automática
          isInvalid={!!error || inputProps.isInvalid}
          errorMessage={error?.message || inputProps.errorMessage}
          // Gestión del valor (evitamos el 0 forzado que mueve el cursor)

          value={!value ? "" : value}
          onValueChange={(values) => {
            onChange(values.floatValue === undefined ? "" : values.floatValue);
          }}
          // Inyectamos el resto de props visuales de HeroUI
          {...inputProps}
        />
      )}
    />
  );
}
