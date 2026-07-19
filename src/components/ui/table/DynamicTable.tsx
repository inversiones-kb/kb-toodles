import dynamic from "next/dynamic";
import { Spinner } from "@heroui/react";
import type { BaseTableProps } from "./BaseTable";
import { ComponentType } from "react";

// 1. Declaramos el componente dinámico de forma INTERNA (sin exportarlo directamente)
const DynamicTableInternal = dynamic(() => import("./BaseTable"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex justify-center p-10">
      <Spinner label="Cargando tabla..." color="primary" />
    </div>
  ),
});

// 2. Exportamos una función que SÍ es genérica (<T>) y actúa como puente de tipos
export const DynamicTable = <T extends {}>(props: BaseTableProps<T>) => {
  // Le indicamos a TypeScript que trate el componente dinámico interno
  // usando las props con el tipo genérico T específico de esta instancia
  const TableInstance = DynamicTableInternal as unknown as ComponentType<
    BaseTableProps<T>
  >;

  return <TableInstance {...props} />;
};
