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

import { USER_ROLE_MAP } from "@/types/user.types";
import { Button, Chip, Link as HeroUILink } from "@heroui/react";

import { toast } from "sonner";
import { BaseTableProps } from "@/components/ui/table/BaseTable";
import { QueryConstraint, where } from "firebase/firestore";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { transformEmployee } from "@/utils/normalizers/normalizeEmployees";
import { softDeleteEmployee } from "@/services/employee.service";
import BranchLink from "@/components/general/BranchLink";
import { useParams } from "next/navigation";
import { BUSINESS_BRANCH_MAP } from "@/types/businessBranch.types";

export default function EmployeesPage() {
  const branch = useParams().branch as keyof typeof BUSINESS_BRANCH_MAP;

  const [filters, setFilters] = useState<EmployeeFilters>({
    search: "",
    role: undefined,
    dateRange: {
      start: today(getLocalTimeZone()) as any,
      end: today(getLocalTimeZone()) as any,
    },
  });

  const queryConstraints = useMemo(() => {
    const constraints: QueryConstraint[] = [
      where("is_deleted", "==", false),
      where("branch", "==", branch),
    ];

    if (filters.search) {
      constraints.push(where("name", "==", filters.search));
    }
    if (filters.role) constraints.push(where("role", "==", filters.role));

    if (filters.shift) constraints.push(where("shift", "==", filters.shift));

    if (!filters.showFired) constraints.push(where("is_fired", "==", false));

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
    { key: "status", label: "Estado" },
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

      case "status":
        return item.is_fired ? (
          <Chip color="danger" variant="dot">
            Despedido
          </Chip>
        ) : (
          <Chip color="success" variant="dot">
            Activo
          </Chip>
        );
      case "cv":
        if (!item.cv_attachment)
          return <p className="text-sm text-soft-light">Sin asignar</p>;

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
        if (!item.rif_attachment)
          return <p className="text-sm text-soft-light">Sin asignar</p>;

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
              as={BranchLink}
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
        as={BranchLink}
        href="/dashboard/empleados/crear"
      />
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4 items-stretch">
        <CardTitle Icon={IconUserDollar} title="Empleados" />
        <div className="w-full overflow-x-auto h-full flex">
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
