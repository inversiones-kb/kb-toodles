"use client";

import CardTitle from "@/components/home/CardTitle";
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconUserDollar,
} from "@tabler/icons-react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useMemo, useState } from "react";
import { DynamicTable } from "@/components/ui/table/DynamicTable";

import { Employee } from "@/validations/employee.validations";
import { dateToString } from "@/utils/dateUtils";
import { defaultCellValue } from "@/utils/table.utils";
import { moneyFormatter, numberFormatter } from "@/utils/formatters";
import EmployeeTableToolbar, {
  EmployeeFilters,
} from "@/components/employee/EmployeeTableToolbar";
import FloatingActionButton from "@/components/general/FloatingActionButton";
import Link from "next/link";
import { USER_ROLE_MAP } from "@/types/user.types";
import { Button, Link as HeroUILink } from "@heroui/react";

import { toast } from "sonner";
import { BaseTableProps } from "@/components/ui/table/BaseTable";
import { User } from "@/validations/user.validations";
import { QueryConstraint, where } from "firebase/firestore";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { transformEmployee } from "@/utils/normalizers/normalizeEmployees";
import { softDeleteEmployee } from "@/services/employee.service";

export default function EmployeesPage() {
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: "",
    role: undefined,
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
    if (filters.role) constraints.push(where("role", "==", filters.role));

    return constraints;
  }, [filters]);

  const { data, isLoading, refetch } = useCollectionQuery<Employee>(
    "employees",
    queryConstraints,
    [filters],
    transformEmployee,
  );

  const tableColumns = [
    { key: "role", label: "Rol" },
    { key: "name", label: "Nombre" },
    { key: "shift", label: "Turno" },
    { key: "doc_number", label: "Cédula" },
    { key: "salary", label: "Salario" },
    { key: "hired_at", label: "Contratación" },
    { key: "cv", label: "CV" },
    { key: "rif", label: "RIF" },
    { key: "actions", label: "Acciones" },
  ];

  const renderCell: BaseTableProps<Employee>["renderCell"] = (
    item,
    columnKey,
    handleDelete,
  ) => {
    switch (columnKey) {
      case "role":
        return USER_ROLE_MAP[item.role].title;
      case "name":
        return `${item.name.split(" ")[0]} ${item.last_name.split(" ")[0]}`;

      case "shift":
        return `${item.shift_data.title}`;
      case "hired_at":
        return dateToString(item.hired_at, "DD/MM/YYYY");
      case "doc_number":
        return `${item.doc_type}${numberFormatter.format(item.doc_number)}`;
      case "salary":
        return `$${moneyFormatter.format(item.salary)}`;
      case "cv":
        return (
          <HeroUILink
            href={item.cv_attachment.url}
            target="_blank"
            className="underline"
            isExternal
            showAnchorIcon
          >
            cv.
            {item.cv_attachment.mimeType.split("/").pop()}
          </HeroUILink>
        );
      case "rif":
        return (
          <HeroUILink
            href={item.rif_attachment.url}
            target="_blank"
            className="underline"
            isExternal
            showAnchorIcon
          >
            rif.
            {item.rif_attachment.mimeType.split("/").pop()}
          </HeroUILink>
        );
      case "actions":
        return (
          <div className="flex gap-2 justify-center">
            <Button
              as={Link}
              href={`/dashboard/empleados/${item.id}`}
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
              onPress={() => handleDelete(item)}
            >
              <IconTrash />
            </Button>
          </div>
        );
      default:
        return defaultCellValue(item, columnKey);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await softDeleteEmployee(id);
    /* const res = await createUser(data); */

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    refetch();
    toast.success("Proveedor eliminado");
  };

  return (
    <main className="flex gap-5 h-full">
      <FloatingActionButton
        label="Nuevo"
        startContent={<IconPlus />}
        as={Link}
        href="/dashboard/empleados/crear"
      />
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Empleados" />
        <div className="w-full overflow-y-auto h-full flex justify-center">
          <DynamicTable<Employee>
            columns={tableColumns}
            data={data}
            topContent={
              <EmployeeTableToolbar setFilters={setFilters} filters={filters} />
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
