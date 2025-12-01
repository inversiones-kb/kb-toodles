"use client";

import CardTitle from "@/components/home/CardTitle";
import { IconUserDollar } from "@tabler/icons-react";
import useFetchProviders from "@/hooks/providers/useFetchProviders";
import {
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import EmptyState from "@/components/general/EmptyState";
import Link from "next/link";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { useState } from "react";
import ProvidersSearchBar, {
  ProvidersFilters,
} from "@/components/providers/ProvidersSearchBar";
import { dateToString } from "@/utils/dateUtils";
import Image from "next/image";
import { getProviderTypeData } from "@/types/providersTypes";

export default function ProvidersPage() {
  const [filters, setFilters] = useState<ProvidersFilters>({
    search: "",
    country: "",
    type: "",
    dateRange: {
      start: new CalendarDate(2022, 2, 3),
      end: new CalendarDate(2022, 2, 3),
    },
  });
  const { providers, isLoading } = useFetchProviders(filters);

  const tableColumns = [
    { key: "name", label: "Nombre" },
    { key: "country", label: "País" },
    { key: "type", label: "Tipo" },
    { key: "createdAt", label: "Fecha de creación" },
  ];

  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Proveedores" />
        <div className="w-full overflow-y-auto h-full flex justify-center">
          <Table
            aria-label="Tabla de proveedores"
            selectionMode="multiple"
            classNames={{
              th: "bg-layer-3",
              wrapper: "h-full bg-layer-2 p-2",
              tr: "*:hover:before:!bg-layer-3",
            }}
            topContent={
              <ProvidersSearchBar setFilters={setFilters} filters={filters} />
            }
            topContentPlacement="outside"
            removeWrapper={true}
            isHeaderSticky
          >
            <TableHeader columns={tableColumns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              items={providers}
              loadingContent={<Spinner />}
              emptyContent={
                <EmptyState
                  title="No hay proveedores aún"
                  actionContent={
                    <Button as={Link} href="/proveedores/nuevo">
                      Añadir proveedor
                    </Button>
                  }
                />
              }
            >
              {(provider) => {
                const typeData = getProviderTypeData(provider.type);
                return (
                  <TableRow key={provider.id}>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-soft-light">
                        <Image
                          src={provider.country.flagUrl}
                          alt={provider.country.label}
                          width={20}
                          height={20}
                        />
                        {provider.country.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-soft-light">
                        <typeData.icon size={20} />
                        {typeData.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-soft-light">
                      {dateToString(provider.created_at, "DD/MM/YYYY")}
                    </TableCell>
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
        </div>
      </section>
    </main>
  );
}
