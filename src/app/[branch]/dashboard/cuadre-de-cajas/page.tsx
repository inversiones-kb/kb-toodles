"use client";

import CardTitle from "@/components/home/CardTitle";
import {
  IconEdit,
  IconEyeCheck,
  IconPlus,
  IconTrash,
  IconUserDollar,
} from "@tabler/icons-react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useMemo, useState } from "react";
import { DynamicTable } from "@/components/ui/table/DynamicTable";
import { dateToString } from "@/utils/dateUtils";
import { defaultCellValue } from "@/utils/table.utils";
import EmployeeTableToolbar, {
  EmployeeFilters,
} from "@/components/employee/EmployeeTableToolbar";
import useRegisterBalances from "@/hooks/registerBalance/useRegisterBalances";
import { RegisterBalance } from "@/validations/registerBalance.validations";
import { moneyFormatter, numberFormatter } from "@/utils/formatters";
import { Button, Chip, PressEvent } from "@heroui/react";
import Link from "next/link";
import clsx from "clsx";
import FloatingActionButton from "@/components/general/FloatingActionButton";
import {
  REGISTER_BALANCE_STATUS_MAP,
  REGISTER_BALANCE_STATUSES,
} from "@/types/registerBalance.types";
import RegisterBalanceToolbar, {
  RegisterBalanceFilters,
} from "@/components/registerBalances/RegisterBalanceTableToolbar";
import { deleteDoc, orderBy, QueryConstraint, where } from "firebase/firestore";
import { toast } from "sonner";
import { softDeleteRegisterBalance } from "@/services/register-balance.service";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import BranchLink from "@/components/general/BranchLink";
import { useParams } from "next/navigation";
import { BUSINESS_BRANCH_MAP } from "@/types/businessBranch.types";
import { BaseTableProps } from "@/components/ui/table/BaseTable";

export default function RegisterBalancesPage() {
  const branch = useParams().branch as keyof typeof BUSINESS_BRANCH_MAP;

  const [filters, setFilters] = useState<RegisterBalanceFilters>({
    search: "",
    status: "PENDING",
    checkout_number: undefined,
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

    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.checkout_number) {
      constraints.push(where("checkout_number", "==", filters.checkout_number));
    }

    constraints.push(orderBy("created_at", "desc"));
    constraints.push(orderBy("checkout_number", "asc"));

    return constraints;
  }, [filters]);

  const { data, isLoading, refetch } = useCollectionQuery<RegisterBalance>(
    "register_balances",
    queryConstraints,
    [filters],
  );

  const tableColumns = [
    { key: "checkout_number", label: "Caja" },
    /* { key: "type", label: "Tipo" }, */
    { key: "user_snapshot", label: "Cajero" },
    { key: "total_expenses", label: "Gastos" },
    { key: "sales", label: "Venta" },
    { key: "created_at", label: "Fecha de creación" },
    { key: "diff", label: "Diferencia" },
    { key: "status", label: "Estado" },

    { key: "actions", label: "Acciones" },
  ];

  const renderCell: BaseTableProps<RegisterBalance>["renderCell"] = (
    item,
    columnKey,
    handleDelete,
  ) => {
    const usd1 = item.money ? item.money.usd.cash1 * item.money.usd.rate1 : 0;
    const usd2 = item.money ? item.money.usd.cash2 * item.money.usd.rate2 : 0;

    switch (columnKey) {
      case "checkout_number":
        return `#${item.checkout_number}`;
      case "type":
        return item.is_fiscal ? "Fiscal" : "No Fiscal";
      case "sales":
        if (!item.money) return "--";

        return `$${moneyFormatter.format(item.money.cop.cash + (usd1 + usd2) + item.total_expenses)}`;

      case "total_expenses":
        return `$${moneyFormatter.format(item.total_expenses)}`;

      case "user_snapshot":
        return `${item.user_snapshot.name.split(" ")[0]} ${item.user_snapshot.last_name.split(" ")[0]}`;
      case "created_at":
        return dateToString(item.created_at, "DD/MM/YYYY");
      case "status":
        const status = item.status;
        return (
          <Chip
            variant="dot"
            color={
              status === "OPEN"
                ? "default"
                : status === "PENDING"
                  ? "warning"
                  : "success"
            }
            className="text-sm text-soft-light"
          >
            {REGISTER_BALANCE_STATUS_MAP[status].title}
          </Chip>
        );
        {
          /* <p
            className={clsx([
              "text-sm font-medium",
              { "text-warning": status === "PENDING" },
              { "text-success": status === "CHECKED" },
            ])}
          >
            {REGISTER_BALANCE_STATUS_MAP[status].title}
          </p> */
        }
      case "diff":
        if (item.status !== "CHECKED") return "--";
        if (!item.money) return "--";

        const totalCop =
          item.money.cop.cash + usd1 + usd2 + item.total_expenses;
        const diff = totalCop - item.money.cop.system;
        const isBalanced = Math.abs(diff) <= 100; // 100 cop grace interval

        return (
          <div className="flex flex-col gap-0.5 items-center">
            <div
              className={clsx([
                "w-full h-fit rounded-full bg-soft-light/30 p-1 flex",
              ])}
            >
              <span
                className={clsx([
                  "w-full inline h-2 rounded-full",
                  isBalanced
                    ? "bg-success"
                    : diff < 0
                      ? "bg-error"
                      : "bg-warning",
                ])}
              />
            </div>
            <p
              className={clsx([
                "text-xs font-normal",
                isBalanced
                  ? "text-success"
                  : diff < 0
                    ? "text-error"
                    : "text-warning",
              ])}
            >
              {isBalanced
                ? "Perfecto"
                : diff < 0
                  ? `-$${numberFormatter.format(Math.abs(diff))}`
                  : `+$${numberFormatter.format(diff)}`}
            </p>
          </div>
        );
      case "actions":
        return (
          <div className="flex gap-2 justify-center sticky">
            <Button
              as={BranchLink}
              href={`/dashboard/cuadre-de-cajas/${item.id}/revision`}
              isIconOnly
              size="sm"
              variant="flat"
            >
              {item.status === "PENDING" ? <IconEyeCheck /> : <IconEdit />}
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
    const res = await softDeleteRegisterBalance(id);
    /* const res = await createUser(data); */

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    refetch();
    toast.success("Cuadre de caja eliminado");
  };

  return (
    <main className="flex gap-5 h-full">
      {/*  <FloatingActionButton
        label="Nuevo"
        startContent={<IconPlus />}
        as={BranchLink}
        href="/dashboard/cuadre-de-cajas/crear"
      /> */}
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Cuadre de cajas" />
        <div className="w-full overflow-y-auto h-full flex justify-center">
          <DynamicTable<RegisterBalance>
            columns={tableColumns}
            data={data}
            topContent={
              <RegisterBalanceToolbar
                setFilters={setFilters}
                filters={filters}
              />
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
