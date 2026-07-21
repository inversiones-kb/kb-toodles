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
import useEmployees from "@/hooks/employee/useEmployees";
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
import useUsers from "@/hooks/users/useUsers";
import { User } from "@/validations/user.validations";
import { useAuthStore } from "@/app/context/AuthProvider";
import clsx from "clsx";
import { Button, Switch } from "@heroui/react";
import { BaseTableProps } from "@/components/ui/table/BaseTable";
import { softDeleteUser, updateUser } from "@/services/user.service";
import { toast } from "sonner";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { QueryConstraint, where } from "firebase/firestore";
import { transformUser } from "@/utils/normalizers/normalizeUsers";
import BranchLink from "@/components/general/BranchLink";
import { useParams } from "next/navigation";
import { BUSINESS_BRANCH_MAP } from "@/types/businessBranch.types";

export default function UsersPage() {
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

    return constraints;
  }, [filters]);

  const { data, isLoading, refetch } = useCollectionQuery<User>(
    "users",
    queryConstraints,
    [filters],
    transformUser,
  );

  const tableColumns = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Correo" },
    { key: "role", label: "Rol" },
    { key: "status", label: "Estado" },
    { key: "actions", label: "Acciones" },
  ];
  const user = useAuthStore((store) => store.user);

  const renderCell: BaseTableProps<User>["renderCell"] = (
    item,
    columnKey,
    handleDelete,
  ) => {
    switch (columnKey) {
      case "role":
        return item.role_data.title;
      case "name":
        return (
          <p>
            {item.name} {item.last_name}{" "}
            {item.uid === user?.uid && (
              <span className="text-brand-primary font-bold">(Tú)</span>
            )}
          </p>
        );

      case "status":
        const active = item.is_active;

        return (
          <Switch
            isSelected={active}
            isDisabled={user?.uid === item.uid}
            onValueChange={(value) => toggleUserStatus(item.id, value)}
          />
        );

      case "actions":
        return user?.uid !== item.uid ? (
          <div className="flex gap-2 justify-center">
            <Button
              as={BranchLink}
              href={`/dashboard/usuarios/${item.uid}`}
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
        ) : (
          "--"
        );
      default:
        return defaultCellValue(item, columnKey);
    }
  };

  const toggleUserStatus = async (id: string, value: boolean) => {
    toast.promise(
      updateUser(id, {
        is_active: value,
      }),
      {
        loading: "Cargando...",
        success: (data) => {
          refetch();
          return value ? "Usuario activado" : "Usuario desactivado";
        },
        error: `No se puedo ${value ? "activar" : "desactivar"} el usuario`,
      },
    );
  };

  const handleDelete = async (id: string) => {
    const res = await softDeleteUser(id);
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
        href="/dashboard/usuarios/crear"
      />
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Usuarios" />
        <div className="w-full overflow-y-auto h-full flex justify-center">
          <DynamicTable<User>
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
