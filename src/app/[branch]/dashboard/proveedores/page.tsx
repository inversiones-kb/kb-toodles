"use client";

import CardTitle from "@/components/home/CardTitle";
import {
  IconBuildingStore,
  IconEdit,
  IconPlus,
  IconTrash,
  IconUserCircle,
  IconUserDollar,
} from "@tabler/icons-react";
import { Button, Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import useProviders from "@/hooks/providers/useProviders";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useMemo, useState } from "react";
import ProviderTableToolbar, {
  ProviderFilters,
} from "@/components/provider/ProviderTableToolbar";
import { DynamicTable } from "@/components/ui/table/DynamicTable";
import { Provider } from "@/validations/provider.validations";
import Image from "next/image";
import { defaultCellValue } from "@/utils/table.utils";
import { PROVIDER_TYPE_MAP } from "@/types/providersTypes";
import { dateToString } from "@/utils/dateUtils";
import Link from "next/link";
import FloatingActionButton from "@/components/general/FloatingActionButton";
import { toast } from "sonner";
import {
  hardDeleteProvider,
  softDeleteProvider,
} from "@/services/provider.service";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { QueryConstraint, where } from "firebase/firestore";
import { transformProvider } from "@/utils/normalizers/normalizeProviders";
import { BaseTableProps } from "@/components/ui/table/BaseTable";
import BranchLink from "@/components/general/BranchLink";

export default function ProvidersPage() {
  const [filters, setFilters] = useState<ProviderFilters>({
    search: "",
    country: undefined,
    type: undefined,
    dateRange: {
      start: today(getLocalTimeZone()) as any,
      end: today(getLocalTimeZone()) as any,
    },
  });

  const queryConstraints = useMemo(() => {
    const constraints: QueryConstraint[] = [where("is_deleted", "==", false)];

    if (filters.search) {
      constraints.push(where("name", "==", filters.search));
    }
    if (filters.country)
      constraints.push(where("country", "==", filters.country));

    if (filters.type) constraints.push(where("type", "==", filters.type));

    return constraints;
  }, [filters]);

  const { data, isLoading, refetch } = useCollectionQuery<Provider>(
    "providers",
    queryConstraints,
    [filters],
    transformProvider,
  );

  const tableColumns = [
    { key: "name", label: "Nombre" },
    { key: "country", label: "País" },
    { key: "type", label: "Tipo" },
    { key: "created_at", label: "Fecha de creación" },

    { key: "actions", label: "Acciones" },
  ];

  const renderCell: BaseTableProps<Provider>["renderCell"] = (
    item,
    columnKey,
    handleDelete,
  ) => {
    switch (columnKey) {
      case "country":
        return (
          <div className="flex items-center gap-2 text-soft-light">
            <Image
              src={item.country_data.flagUrl}
              alt={item.country_data.title}
              width={20}
              height={20}
            />
            {item.country_data.title}
          </div>
        );
      case "type":
        return (
          <div className="flex items-center gap-1.5 text-soft-light">
            {item.type === "FREELANCER" ? (
              <IconUserCircle size={20} />
            ) : (
              <IconBuildingStore size={20} />
            )}
            {item.type_data.title}
          </div>
        );

      case "created_at":
        return dateToString(item.created_at);

      case "actions":
        return (
          <div className="flex gap-2 justify-center">
            <Button
              as={BranchLink}
              href={`/dashboard/proveedores/${item.id}`}
              isIconOnly
              size="sm"
              variant="flat"
            >
              <IconEdit />
            </Button>
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="flat"
              onPress={(e) => handleDelete(item, e)}
            >
              <IconTrash />
            </Button>
          </div>
        );
      default:
        return defaultCellValue(item, columnKey);
    }
  };

  const handleDelete = async (id: string, hardDelete: boolean = false) => {
    const res = await (hardDelete
      ? hardDeleteProvider(id)
      : softDeleteProvider(id));
    /* const res = await createUser(data); */

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    refetch();
    toast.success(res.message);
  };

  return (
    <main className="flex gap-5 h-full">
      <FloatingActionButton
        label="Nuevo"
        startContent={<IconPlus />}
        as={BranchLink}
        href="/dashboard/proveedores/crear"
      />
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Proveedores" />
        <div className="w-full overflow-y-auto h-full flex justify-center">
          <DynamicTable<Provider>
            columns={tableColumns}
            data={data}
            topContent={
              <ProviderTableToolbar setFilters={setFilters} filters={filters} />
            }
            isLoading={isLoading}
            renderCell={renderCell}
            onDeleteAction={handleDelete}
          />
        </div>
      </section>
    </main>
  );
}
